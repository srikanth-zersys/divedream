import { CirclePlus, Search } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { NextPageWithLayout } from "../../../js/dtos";
import { leadslist1 } from "../../js/data";
import TableContainer from "../../js/components/CustomComponents/Table/Table";
import Pagination from "../../js/components/CommonComponents/Pagination";
import { Link } from "@inertiajs/react";

type Campaign = {
    leadName: string;
    rating: string;
    date: string;
    contact: string;
    leadSource: string;
    leadStatus: string;
    totalBalance: string;
};

const UserData: NextPageWithLayout = () => {
    // const [campaigns, setCampaigns] = useState<Campaign[]>(leadslist1);
    const campaigns: Campaign[] = leadslist1;

    const [filterCampaigns, setFilterCampaigns] = useState<Campaign[]>(leadslist1);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 8;

    const filterCampaignsBySearch = useCallback(() => {
        const filtered = campaigns.filter(campaign =>
            Object.values(campaign).some(value =>
                value.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        setFilterCampaigns(filtered);
    }, [campaigns, searchTerm]);

    useEffect(() => {
        filterCampaignsBySearch();
    }, [filterCampaignsBySearch]);
    const columns = useMemo(() => [
        {
            header: 'Lead Name',
            accessorKey: 'leadName',

        },
        {
            header: 'Rating',
            accessorKey: 'rating',
            cell: ({ row }: any) => (
                <>
                    <i className="text-yellow-500 align-baseline ri-star-fill"></i>
                    {' '}(<span>{row.original.rating}</span>)
                </>
            )

        },
        {
            header: 'Date',
            accessorKey: 'date',
        },
        {
            header: 'Contact',
            accessorKey: 'contact',
        },
        {
            header: 'Lead Source',
            accessorKey: 'leadSource',
            cell: ({ row }: any) => (
                <>
                    <span className="badge badge-gray">{row.original.leadSource}</span>
                </>
            )
        },
        {
            header: 'Lead Status',
            accessorKey: 'leadStatus',
            cell: ({ row }: any) => (
                <>
                    <span className={`${row.original.leadStatus == 'New' ? 'badge badge-sky' : (row.original.leadStatus == 'Contacted' ? 'badge badge-green' : (row.original.leadStatus == 'Interested' ? 'badge badge-yellow' : (row.original.leadStatus == 'Closed' ? 'badge badge-red' : 'badge badge-purple')))}`}>{row.original.leadStatus}</span>
                </>
            )
        },
        {
            header: 'Total Balance',
            accessorKey: 'totalBalance',
        }
    ], []);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEvents = filterCampaigns.slice(startIndex, startIndex + itemsPerPage);
    return (
        <div className="col-span-12 card">
            <div className="grid grid-cols-12 lg:items-center card-header gap-space">
                <div className="col-span-12 lg:col-span-3">
                    <h6 className="card-title">Leads (154)</h6>
                </div>
                <div className="col-span-12 lg:col-start-7 lg:col-span-6 2xl:col-span-4 2xl:col-start-9">
                    <div className="flex items-center gap-space">
                        <div className="relative group/form grow">
                            <input
                                type="email"
                                className="pl-9 form-input group-[&.right]/form:pr-9 group-[&.right]/form:pl-4"
                                placeholder="Search for ..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <button className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 left-3 group-[&.right]/form:right-3 group-[&.right]/form:left-auto focus:outline-none">
                                <Search className="size-4" />
                            </button>
                        </div>
                       </div>
                </div>
            </div>
            <div className="pt-0 card-body">
                <TableContainer
                    isSearch={false}
                    isPagination={false}
                    columns={columns}
                    data={paginatedEvents}
                    divclassName="overflow-x-auto table-box"
                    tableclassName="table whitespace-nowrap"
                    thclassName="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500 cursor-pointer"
                    tbodyclassName="pt-0"
                    thtrclassName="*:px-3 *:py-2.5"
                    isTfoott={false}
                />
                {
                    filterCampaigns.length >= 0 && <Pagination
                        totalItems={filterCampaigns.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                }
            </div>
        </div>
    );
};

export default UserData;
