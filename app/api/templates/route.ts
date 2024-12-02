import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/utils/storage'

export async function GET() {
  try {
    const templates = await storage.get('templates') || []
    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const newTemplate = await request.json()
    const templates = await storage.get('templates') || []
    const updatedTemplates = [...templates, { ...newTemplate, id: Date.now().toString() }]
    await storage.set('templates', updatedTemplates)
    return NextResponse.json(updatedTemplates)
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updatedTemplate = await request.json()
    const templates = await storage.get('templates') || []
    const updatedTemplates = templates.map((template: any) => 
      template.id === updatedTemplate.id ? updatedTemplate : template
    )
    await storage.set('templates', updatedTemplates)
    return NextResponse.json(updatedTemplates)
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    const templates = await storage.get('templates') || []
    const updatedTemplates = templates.filter((template: any) => template.id !== id)
    await storage.set('templates', updatedTemplates)
    return NextResponse.json(updatedTemplates)
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}

