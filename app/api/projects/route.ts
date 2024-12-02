import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/utils/storage'

export async function GET() {
  try {
    const projects = await storage.get('projects') || []
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const newProject = await request.json()
    const projects = await storage.get('projects') || []
    const updatedProjects = [...projects, { ...newProject, id: Date.now().toString() }]
    await storage.set('projects', updatedProjects)
    return NextResponse.json(updatedProjects)
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updatedProject = await request.json()
    const projects = await storage.get('projects') || []
    const updatedProjects = projects.map((project: any) => 
      project.id === updatedProject.id ? updatedProject : project
    )
    await storage.set('projects', updatedProjects)
    return NextResponse.json(updatedProjects)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    const projects = await storage.get('projects') || []
    const updatedProjects = projects.filter((project: any) => project.id !== id)
    await storage.set('projects', updatedProjects)
    return NextResponse.json(updatedProjects)
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}

