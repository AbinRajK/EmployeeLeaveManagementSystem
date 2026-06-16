import "./Pagination.css";

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  const getVisiblePages = () => {
    const pages = [];

    const start = Math.max(
      1,
      currentPage - 2
    );

    const end = Math.min(
      totalPages,
      currentPage + 2
    );

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages =
    getVisiblePages();

  return (
    <div className="pagination">
      <button
        disabled={currentPage === 1}
        onClick={() =>
          onPageChange(1)
        }
      >
        {"<<"}
      </button>

      <button
        disabled={currentPage === 1}
        onClick={() =>
          onPageChange(
            currentPage - 1
          )
        }
      >
        {"<"}
      </button>

      {visiblePages[0] > 1 && (
        <>
          <button
            onClick={() =>
              onPageChange(1)
            }
          >
            1
          </button>

          {visiblePages[0] > 2 && (
            <span className="dots">
              ...
            </span>
          )}
        </>
      )}

      {visiblePages.map((page) => (
        <button
          key={page}
          className={
            currentPage === page
              ? "active-page"
              : ""
          }
          onClick={() =>
            onPageChange(page)
          }
        >
          {page}
        </button>
      ))}

      {visiblePages[
        visiblePages.length - 1
      ] < totalPages && (
        <>
          {visiblePages[
            visiblePages.length - 1
          ] <
            totalPages - 1 && (
            <span className="dots">
              ...
            </span>
          )}

          <button
            onClick={() =>
              onPageChange(
                totalPages
              )
            }
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        disabled={
          currentPage ===
          totalPages
        }
        onClick={() =>
          onPageChange(
            currentPage + 1
          )
        }
      >
        {">"}
      </button>

      <button
        disabled={
          currentPage ===
          totalPages
        }
        onClick={() =>
          onPageChange(
            totalPages
          )
        }
      >
        {">>"}
      </button>
    </div>
  );
}

export default Pagination;