import { PageHeader } from "@/components/shell/page-header";
import { AddContactsForm } from "@/components/contacts/add-contacts-form";
import { buildTree, getGroups } from "@/lib/groups";

export const metadata = { title: "Add contacts · Outreach Call Center" };

export default async function NewContactsPage() {
  const groups = await getGroups();
  const tree = buildTree(groups);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Add contacts"
        subtitle="Bulk-enter a cell's collated list"
      />
      <AddContactsForm tree={tree} />
    </div>
  );
}
