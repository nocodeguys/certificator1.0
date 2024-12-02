"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { logger } from "@/utils/logger"

interface Template {
  id: string
  name: string
  content: string
}

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateContent, setNewTemplateContent] = useState("")
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (!response.ok) throw new Error('Failed to fetch templates')
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      logger.error('Error fetching templates', { error })
    }
  }

  const addOrUpdateTemplate = async () => {
    if (newTemplateName && newTemplateContent) {
      try {
        const method = editingTemplate ? 'PUT' : 'POST'
        const body = editingTemplate
          ? { ...editingTemplate, name: newTemplateName, content: newTemplateContent }
          : { name: newTemplateName, content: newTemplateContent }

        const response = await fetch('/api/templates', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!response.ok) throw new Error(`Failed to ${editingTemplate ? 'update' : 'create'} template`)
        const updatedTemplates = await response.json()
        setTemplates(updatedTemplates)
        setNewTemplateName("")
        setNewTemplateContent("")
        setEditingTemplate(null)
        logger.info(`Template ${editingTemplate ? 'updated' : 'created'} successfully`, body)
      } catch (error) {
        logger.error(`Error ${editingTemplate ? 'updating' : 'creating'} template`, { error, body })
      }
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) throw new Error('Failed to delete template')
      const updatedTemplates = await response.json()
      setTemplates(updatedTemplates)
      logger.info('Template deleted successfully', { id })
    } catch (error) {
      logger.error('Error deleting template', { error, id })
    }
  }

  const startEditing = (template: Template) => {
    setEditingTemplate(template)
    setNewTemplateName(template.name)
    setNewTemplateContent(template.content)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Templates</h2>
      <div className="space-y-2 mb-4">
        <Input
          placeholder="Template name"
          value={newTemplateName}
          onChange={(e) => setNewTemplateName(e.target.value)}
        />
        <Textarea
          placeholder="Template content"
          value={newTemplateContent}
          onChange={(e) => setNewTemplateContent(e.target.value)}
        />
        <Button onClick={addOrUpdateTemplate}>
          {editingTemplate ? 'Update Template' : 'Add Template'}
        </Button>
      </div>
      <ul>
        {templates.map((template) => (
          <li key={template.id} className="mb-2 border-b pb-2">
            <div className="flex items-center justify-between mb-1">
              <strong>{template.name}</strong>
              <div>
                <Button variant="outline" size="sm" onClick={() => startEditing(template)} className="mr-2">Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => deleteTemplate(template.id)}>Delete</Button>
              </div>
            </div>
            <p className="text-sm text-gray-600">{template.content}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

