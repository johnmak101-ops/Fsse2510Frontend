import AdminPromotionForm from "@/features/admin/components/AdminPromotionForm";

export default async function EditPromotionPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    return <AdminPromotionForm promotionId={parseInt(params.id)} />;
}
