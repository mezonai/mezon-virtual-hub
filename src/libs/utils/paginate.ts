import { Result } from "@types";

export const paginate = async <T, R>(
    repositoryQuery: (() => Promise<[T[], number]>) | [T[], number],
    pageSize: number = 10,
    pageNumber: number = 1,
    mapper?: (entity: T) => R,
) => {
    const [data, totalCount] = Array.isArray(repositoryQuery)
        ? repositoryQuery // If data is already available, use it directly
        : await repositoryQuery(); // Otherwise, fetch from repositoryQuery function

    const totalPages = Math.ceil(totalCount / pageSize);
    const hasPreviousPage = pageNumber > 1;
    const hasNextPage = pageNumber < totalPages;

    const mappedData = mapper ? data.map(mapper) : (data as unknown as R[]);

    return new Result({
        data: mappedData,
        pageSize:
            pageSize > totalCount && pageNumber === 1 ? totalCount : pageSize,
        pageNumber,
        totalPages,
        totalCount,
        hasPreviousPage,
        hasNextPage,
    });
};
