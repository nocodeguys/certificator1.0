"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { logger } from "@/utils/logger"

interface Project {
  id: string
  name: string
  template: string
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [newProjectName, setNewProjectName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (!response.ok) throw new Error('Failed to fetch projects')
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      logger.error('Error fetching projects', { error })
    }
  }

  const addOrUpdateProject = async () => {
    if (newProjectName && selectedTemplate) {
      try {
        const method = editingProject ? 'PUT' : 'POST'
        const body = editingProject
          ? { ...editingProject, name: newProjectName, template: selectedTemplate }
          : { name: newProjectName, template: selectedTemplate }

        const response = await fetch('/api/projects', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!response.ok) throw new Error(`Failed to ${editingProject ? 'update' : 'create'} project`)
        const updatedProjects = await response.json()
        setProjects(updatedProjects)
        setNewProjectName("")
        setSelectedTemplate("")
        setEditingProject(null)
        logger.info(`Project ${editingProject ? 'updated' : 'created'} successfully`, body)
      } catch (error) {
        logger.error(`Error ${editingProject ? 'updating' : 'creating'} project`, { error, body })
      }
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) throw new Error('Failed to delete project')
      const updatedProjects = await response.json()
      setProjects(updatedProjects)
      logger.info('Project deleted successfully', { id })
    } catch (error) {
      logger.error('Error deleting project', { error, id })
    }
  }

  const startEditing = (project: Project) => {
    setEditingProject(project)
    setNewProjectName(project.name)
    setSelectedTemplate(project.template)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Projects</h2>
      <div className="flex space-x-2 mb-4">
        <Input
          placeholder="Project name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Template</SelectItem>
            {/* Add more templates here */}
          </SelectContent>
        </Select>
        <Button onClick={addOrUpdateProject}>
          {editingProject ? 'Update Project' : 'Add Project'}
        </Button>
      </div>
      <ul>
        {projects.map((project) => (
          <li key={project.id} className="mb-2 flex items-center justify-between">
            <span>{project.name} (Template: {project.template})</span>
            <div>
              <Button variant="outline" size="sm" onClick={() => startEditing(project)} className="mr-2">Edit</Button>
              <Button variant="destructive" size="sm" onClick={() => deleteProject(project.id)}>Delete</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

