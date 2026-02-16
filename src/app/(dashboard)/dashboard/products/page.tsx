import { getOrgId } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductsTable } from "@/components/products/products-table";
import { Package } from "lucide-react";

export const metadata = { title: "Products" };

export default async function ProductsPage() {
  const { supabase, orgId } = await getOrgId();

  const { data: products } = await supabase
    .from("products")
    .select("*, competitors!inner(name, organization_id)")
    .eq("competitors.organization_id", orgId)
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="All products tracked across your competitors"
      />

      {(!products || products.length === 0) ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="Products will appear here once your competitors have been scraped"
        />
      ) : (
        <ProductsTable products={products as any} />
      )}
    </div>
  );
}
