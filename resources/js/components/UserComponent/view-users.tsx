import React, { useMemo, useState, useEffect } from "react";
import { Eye, UserPlus, Plus, Edit, X, Filter } from "lucide-react";
import TableContainer from "../../../js/components/CustomComponents/Table/Table";
import { EditUser } from "./edit-users";
import UsersFilter, { FilterValues } from "./user-filters";
import { Link, router, usePage } from "@inertiajs/react";

import { capitalizeWords, customFilterFunction, formatDate, formatDateTime } from "../../hooks/helperFunction";
interface UserRole {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    pivot: {
        model_type: string;
        model_id: number;
        role_id: number;
    };
}

interface UserDetails {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles: UserRole[];
}

interface ViewUsersProps {
    usersData: {
        current_page: number;
        data: UserDetails[];
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    };
}
interface PageProps {
    flash: {
        success?: string;
        error?: string;
    };
    errors: Record<string, string>;
}

const ViewUsers: React.FC<ViewUsersProps> = ({
    usersData,
}) => {
    const { flash } = usePage().props as PageProps;
    const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
    
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");
    const [appliedFilters, setAppliedFilters] = useState<FilterValues>({
        name: "",
        role: "",
        status: "",
    });
    const [filteredData, setFilteredData] = useState<UserDetails[]>(
        usersData.data || []
    );

    useEffect(() => {
        if (flash?.success) {
            setMessage({ type: "success", text: flash.success });
            const timer = setTimeout(() => setMessage(null), 5000); // Hide after 5 seconds
            return () => clearTimeout(timer);
        }
        if (flash?.error) {
            setMessage({ type: "error", text: flash.error });
            const timer = setTimeout(() => setMessage(null), 5000); // Hide after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Process the data for display
    const processedData = useMemo(() => {
        // Handle both possible data structures
        const users = Array.isArray(usersData) ? usersData : usersData.data || [];
        
        // Dummy data for testing helper functions (can be removed after verification)
        // const testdata = {
        //     id: 999,
        //     name: "test user one",
        //     email: "test.user@example.com",
        //     phone: null,
        //     status: "Inactive",
        //     email_verified_at: null,
        //     created_at: "2023-01-15T10:30:00.000000Z", 
        //     updated_at: "2023-01-15T10:30:00.000000Z",
        //     roles: [{ id: 3, name: "user", guard_name: "web", created_at: "2023-01-01", updated_at: "2023-01-01", pivot: { model_type: "App\\Models\\User", model_id: 999, role_id: 3 } }],
        // };

        const combinedUsers = [...users]; 

        const startIndex = 1; 

        return combinedUsers.map((user, index) => {   
            return {
            ...user,
            sr_no: startIndex + index, 
            name: capitalizeWords(user.name),
            email: user.email.toLowerCase(),
            role: user.roles && user.roles.length > 0 ? user.roles[0].name : "N/A",
            status: user.status || "Active", 
            formatted_created_at: formatDateTime(user.created_at), 
            formatted_date: formatDate(user.created_at), 
            sortable_date: user.created_at ? new Date(user.created_at).getTime() : 0, 
            };
        });
    }, [usersData]);

    const handleRefresh = () => {
        setGlobalFilter("");
        setAppliedFilters({
            name: "",
            role: "",
            status: "",
        });
        setFilteredData(processedData);
    };

    // Handle filter changes from the filter panel
    const handleFilterChange = (filters: FilterValues) => {
        setAppliedFilters(filters);

        let newFilteredData = [...processedData];

        // Apply name/email filter
        if (filters.name) {
            const searchTerm = filters.name.toLowerCase();
            newFilteredData = newFilteredData.filter(
                (user) =>
                    user.name.toLowerCase().includes(searchTerm) ||
                    user.email.toLowerCase().includes(searchTerm)
            );
        }

        // Apply role filter - fix the case sensitivity
        if (filters.role) {
            const roleMap = {
                Admin: "admin",
                ASM: "asm",
                "Circle Head": "circlehead",
            };

            const filterRole =
                roleMap[filters.role] || filters.role.toLowerCase();
            newFilteredData = newFilteredData.filter(
                (user) => user.role.toLowerCase() === filterRole.toLowerCase()
            );
        }

        // Apply status filter
        if (filters.status) {
            newFilteredData = newFilteredData.filter(
                (user) => user.status === filters.status
            );
        }

        setFilteredData(newFilteredData);
    };
    
    // Reset filters
    const resetFilters = () => {
        setAppliedFilters({
            name: "",
            role: "",
            status: "",
        });
        setFilteredData(processedData);
    };

    // Define table columns using useMemo
    const columns = useMemo(
        () => [
            {
                accessorKey: "sr_no",
                header: "Sr.No",
                cell: ({ row }) => row.original.sr_no,
            },
            {
                accessorKey: "name",
                header: "Name",
                cell: ({ row }) => (
                    <div className="break-words whitespace-normal ">
                        {row.original.name}
                    </div>
                ),
            },
            {
                accessorKey: "email",
                header: "Email",
                cell: ({ row }) => (
                    <div className="break-words whitespace-normal ">
                        {row.original.email}
                    </div>
                ),
            },
            {
                accessorKey: "role",
                header: "Role",
                cell: ({ row }) => (
                    <div className="break-words whitespace-normal ">
                        {row.original.role == "admin"
                            ? capitalizeWords(row.original.role)
                            : row.original.role == "circlehead"
                            ? "CH"
                            : row.original.role.toUpperCase()}
                    </div>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    return (
                        <span
                            className={`inline-flex items-center text-gray-900 rounded-full px-2 py-1 text-xs font-semibold ${
                                row.original.status === "Active"
                                    ? "bg-green-100 text-green-500"
                                    : "bg-red-100 text-red-500"
                            }`}
                        >
                            {row.original.status}
                        </span>
                    );
                },
            },
            {
                accessorKey: "sortable_date",
                header: "Created Date",
                cell: ({ row }) => row.original.formatted_date,
            },
            {
                accessorKey: "actions",
                header: "Action",
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex justify-start">
                        <Link
                            href={route("users.edit", { id: row.original.id })}
                            className="bg-gray-50 p-2 text-gray-400 hover:text-gray-600 rounded-lg inline-block mr-2"
                            title="Edit User"
                        >
                            <Edit size={18} />
                        </Link>
                    </div>
                ),
            },
        ],
        []
    );

    // Set filtered data when usersData changes
    React.useEffect(() => {
        setFilteredData(processedData);
    }, [processedData]);

    // Check if any filters are applied
    const hasActiveFilters =
        appliedFilters.name !== "" ||
        appliedFilters.role !== "" ||
        appliedFilters.status !== "";

    return (
        <div className="w-full lg:px-0 px-0 overflow-hidden dark:bg-gray-900 dark:border-gray-700">
            {message && (
                <div
                    className={`my-4 p-3 rounded-md ${
                        message.type === "success"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    }`}
                >
                    {message.text}
                </div>
            )}
            <div className="rounded-[10px] border border-stroke bg-white mt-5  dark:bg-gray-900 dark:border-gray-700 dark:shadow-card p-2 sm:p-4 shadow-1">
                {/* Global Search, Filter and Add User Button */}
                <div className="mb-5 flex flex-col md:flex-row justify-end items-center gap-6 dark:bg-gray-900 ">
                    {/* Global Search field */}

                    <div className="flex space-x-2">
                        {/* Filter Button with Indicator */}
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="relative rounded-[5px] dark:bg-blue-500 bg-blue-50 px-3 py-3 text-sm font-semibold text-blue-600 dark:text-white shadow-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            <div className="flex items-center space-x-2">
                                <Filter size={18} />
                                <span>Filter</span>
                            </div>
                        </button>

                        {/* Add User Button */}
                        <a
                            href={'/user-management/create'}
                            className="block w-full md:w-auto rounded-[5px] bg-green-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto"
                        >
                            <div className="flex items-center space-x-2">
                                <Plus size={18} />
                                <span>Add User</span>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Active filters bar */}
                {hasActiveFilters && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 mb-4 rounded-md flex flex-wrap items-center gap-2">
                        <span className="text-gray-600 dark:text-white text-sm font-medium">
                            Active filters:
                        </span>

                        {appliedFilters.name && (
                            <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded text-xs font-medium">
                                Name/Email: {appliedFilters.name}
                            </span>
                        )}

                        {appliedFilters.role && (
                            <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded text-xs font-medium">
                                Role: {appliedFilters.role}
                            </span>
                        )}

                        {appliedFilters.status && (
                            <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded text-xs font-medium">
                                Status: {appliedFilters.status}
                            </span>
                        )}

                        <button
                            onClick={resetFilters}
                            className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs"
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {/* Table Container */}
                <div className="table-container">
                    <TableContainer
                        columns={columns}
                        data={filteredData}
                        divclassName="overflow-x-auto lg:w-full md:w-full w-96 dark:bg-gray-900"
                        tableclassName="display group dataTable table whitespace-nowrap dtr-inline dark:bg-gray-900"
                        PaginationClassName="pagination-container"
                        isPaginationn={true}
                        thtrclassName="bg-gray-100 dark:bg-dark-900 dark:text-white dt-orderable-asc dt-orderable-desc dt-ordering-desc"
                        thclassName="dark:text-white px-4 py-3 text-sm font-semibold text-start dark:bg-gray-900 "
                        tdclassName="dark:text-white px-4 py-3 text-start dark:bg-gray-900"
                        classtyle="100%"
                        isSearch={false}
                        globalFilter={globalFilter}
                        customFilterFunction={customFilterFunction}
                    />
                </div>
            </div>

            {/* Filter Panel */}
            <UsersFilter
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
            />
        </div>
    );
};

export default ViewUsers;