import AdminMembershipConfigList from "@/features/admin/components/AdminMembershipConfigList";

export default function MembershipAdminPage() {
    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">
                    Membership Management
                </h1>
                <p className="text-stone-500">
                    Configure point earning rates and requirements for each membership tier
                </p>
            </div>

            <AdminMembershipConfigList />
        </div>
    );
}
