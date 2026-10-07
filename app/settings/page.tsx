import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <>
      <Header title="Settings" subtitle="Workspace preferences." />
      <div className="mt-5 max-w-[640px]">
        <Card>
          <CardHeader>
            <CardTitle>Operations workspace</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-[13.5px]">
            <p className="text-muted-foreground">This is a local educational inventory system. Data is stored in MongoDB via Prisma.</p>
            <p>Database: <code className="rounded-[6px] bg-muted px-1.5 py-0.5 text-[12.5px]">mongodb://localhost:27017/inventory_management</code></p>
            <p className="text-muted-foreground">Use the theme toggle in the header to switch between light and dark mode. Your choice persists across reloads.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
