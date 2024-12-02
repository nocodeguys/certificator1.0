import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Projects from "@/components/Projects"
import Templates from "@/components/Templates"
import Logs from "@/components/Logs"
import Settings from "@/components/Settings"
import CertificateGenerator from "@/components/CertificateGenerator"

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Certificator</h1>
      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="projects">
          <Projects />
        </TabsContent>
        <TabsContent value="templates">
          <Templates />
        </TabsContent>
        <TabsContent value="generator">
          <CertificateGenerator />
        </TabsContent>
        <TabsContent value="logs">
          <Logs />
        </TabsContent>
        <TabsContent value="settings">
          <Settings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

