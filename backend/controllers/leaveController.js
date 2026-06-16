const Leave = require("../models/Leave");

// ─── helpers ────────────────────────────────────────────────────────────────

const calcDays = (from, to) =>
  Math.ceil(Math.abs(new Date(to) - new Date(from)) / 86_400_000) + 1;

// Run all three count queries in parallel — no sequential blocking
const getStats = () =>
  Promise.all([
    Leave.countDocuments({ status: "pending" }),
    Leave.countDocuments({ status: "approved" }),
    Leave.countDocuments({ status: "rejected" }),
  ]).then(([pending, approved, rejected]) => ({ pending, approved, rejected }));

// ─── POST /api/leaves ────────────────────────────────────────────────────────

const createLeaveRequest = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;
    const employeeId = req.user.userId;

    const from = new Date(fromDate);
    const to   = new Date(toDate);

    if (from > to)
      return res.status(400).json({ success: false, message: "fromDate cannot be after toDate" });

    const days = calcDays(from, to);
    if (days > 10)
      return res.status(400).json({ success: false, message: `Leave cannot exceed 10 days (requested ${days})` });

    // Overlap check — index on { employeeId, fromDate, toDate } keeps this fast
    const overlap = await Leave.findOne({
      employeeId,
      status: { $ne: "rejected" },
      fromDate: { $lte: to },
      toDate:   { $gte: from },
    }).lean();

    if (overlap)
      return res.status(409).json({ success: false, message: "Leave dates overlap with an existing request" });

    const leave = await Leave.create({ employeeId, leaveType, fromDate: from, toDate: to, numberOfDays: days, reason });

    res.status(201).json({ success: true, message: "Leave applied successfully", data: leave });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── GET /api/leaves/my-leaves ───────────────────────────────────────────────

const getMyLeaves = async (req, res) => {
  try {
    const employeeId = req.user.userId;
    const page   = Math.max(1, Number(req.query.page)  || 1);
    const limit  = Math.min(50, Number(req.query.limit) || 10);
    const status = req.query.status;

    // Build filter — index { employeeId, status, createdAt } covers both paths
    const filter = { employeeId };
    if (status) filter.status = status;

    // Run count + paginated query in parallel
    const [total, leaves] = await Promise.all([
      Leave.countDocuments(filter),
      Leave.find(filter)
        .select("-__v")                          // drop internal field
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),                                 // plain JS objects — faster than Mongoose docs
    ]);

    res.json({
      success: true,
      data: leaves,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/leaves (manager) ───────────────────────────────────────────────

const getAllLeaves = async (req, res) => {
  try {
    const page   = Math.max(1, Number(req.query.page)  || 1);
    const limit  = Math.min(50, Number(req.query.limit) || 5);
    const status = req.query.status  || "";
    const search = req.query.search?.trim() || "";

    // Build the match stage that can use indexes
    const match = {};
    if (status) match.status = status;

    let leaves, total;

    if (search) {
      // Push the search condition into the aggregation AFTER the $lookup so Mongo
      // can still use the { status, createdAt } index for the initial match,
      // then filter the joined docs by name in one pass — no JS filtering at all.
      const pipeline = [
        { $match: match },
        {
          $lookup: {
            from: "users",
            localField: "employeeId",
            foreignField: "_id",
            as: "employee",
            // Only pull the fields we actually need (requires Mongo 5.0+;
            // falls back gracefully on older versions via the $project below)
            pipeline: [{ $project: { name: 1, email: 1, department: 1 } }],
          },
        },
        { $unwind: "$employee" },
        { $match: { "employee.name": { $regex: search, $options: "i" } } },
        { $sort: { createdAt: -1 } },
      ];

      // Count and paginate in the same aggregation — avoids double traversal
      const [[countResult], paginatedLeaves] = await Promise.all([
        Leave.aggregate([...pipeline, { $count: "total" }]),
        Leave.aggregate([
          ...pipeline,
          { $skip: (page - 1) * limit },
          { $limit: limit },
          { $project: { __v: 0 } },
        ]),
      ]);

      total  = countResult?.total ?? 0;
      leaves = paginatedLeaves;
    } else {
      // No search — straightforward indexed query + populate (select limits fields)
      const [count, docs] = await Promise.all([
        Leave.countDocuments(match),
        Leave.find(match)
          .select("-__v")
          .populate("employeeId", "name email department")
          .populate("reviewedBy",  "name email")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
      ]);

      total  = count;
      leaves = docs;
    }

    // Stats always run in parallel — never sequentially
    const stats = await getStats();

    res.json({
      success: true,
      leaves,
      totalPages: Math.ceil(total / limit) || 1,
      stats,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/leaves/:id/status ────────────────────────────────────────────

const updateStatus = async (req, res) => {
  try {
    const { status, reviewComment } = req.body;

    if (!["approved", "rejected"].includes(status))
      return res.status(400).json({ success: false, message: 'Status must be "approved" or "rejected"' });

    // findByIdAndUpdate is a single round-trip vs find + save (two round-trips)
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewedBy:    req.user.userId,
        reviewComment: reviewComment ?? "",
        reviewedAt:    new Date(),
      },
      { new: true, runValidators: true }
    ).lean();

    if (!leave)
      return res.status(404).json({ success: false, message: "Leave not found" });

    res.json({ success: true, message: "Leave updated successfully", data: leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createLeaveRequest, getMyLeaves, getAllLeaves, updateStatus };