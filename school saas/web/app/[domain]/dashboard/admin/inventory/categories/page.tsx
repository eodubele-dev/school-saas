import { getInventoryCategories } from "@/lib/actions/inventory"
import { CategoryManager } from "@/components/inventory/category-manager"

export default async function CategoriesPage() {
    const res = await getInventoryCategories()
    const categories = res.success ? res.data : []

    return (
        <CategoryManager initialCategories={categories} />
    )
}
