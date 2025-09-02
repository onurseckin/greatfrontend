import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
export interface ApiProjectMeta {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  type: 'tsx' | 'jsx';
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiProjectFull extends ApiProjectMeta {
  tsxContent: string;
  cssContent: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string | null;
  type: 'tsx' | 'jsx';
}

@Controller('projects')
export class ProjectDirectController {
  private db = new DatabaseService();

  @Get('list')
  async listProjects(): Promise<ApiProjectMeta[]> {
    try {
      const { projectFull } = this.db.schema;
      const rows = await this.db.drizzle
        .select({
          id: projectFull.id,
          slug: projectFull.slug,
          name: projectFull.name,
          description: projectFull.description,
          type: projectFull.type,
          createdAt: projectFull.createdAt,
          updatedAt: projectFull.updatedAt,
        })
        .from(projectFull)
        .orderBy(projectFull.id);

      return rows.map(r => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        description: r.description,
        type: r.type,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
    } catch (e) {
      console.error('Failed to fetch projects', e);
      return [];
    }
  }

  @Post('create')
  async createProject(@Body() dto: CreateProjectDto): Promise<ApiProjectFull> {
    try {
      const slug = dto.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const tsxContent =
        dto.type === 'tsx'
          ? `import React from 'react';\n\nexport default function App(): React.ReactElement {\n  return (\n    <div>\n      <h1>Hello, ${dto.name}!</h1>\n      <p>Start building your component here.</p>\n    </div>\n  );\n}`
          : `import React from 'react';\n\nexport default function App() {\n  return (\n    <div>\n      <h1>Hello, ${dto.name}!</h1>\n      <p>Start building your component here.</p>\n    </div>\n  );\n}`;
      const cssContent = `/* Styles for ${dto.name} */\nbody { font-family: sans-serif; }`;

      const { projectFull } = this.db.schema;
      const [newProject] = await this.db.drizzle
        .insert(projectFull)
        .values({
          slug,
          name: dto.name,
          description: dto.description ?? null,
          type: dto.type,
          tsxContent,
          cssContent,
        })
        .returning();

      return {
        id: newProject.id,
        slug: newProject.slug,
        name: newProject.name,
        description: newProject.description,
        type: newProject.type,
        tsxContent: newProject.tsxContent,
        cssContent: newProject.cssContent,
        createdAt: newProject.createdAt,
        updatedAt: newProject.updatedAt,
      };
    } catch (e) {
      console.error('Failed to create project', e);
      throw e;
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<ApiProjectFull | null> {
    try {
      const { projectFull } = this.db.schema;
      const rows = await this.db.drizzle
        .select()
        .from(projectFull)
        .where(eq(projectFull.id, Number(id)))
        .limit(1);

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        type: row.type,
        tsxContent: row.tsxContent,
        cssContent: row.cssContent,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    } catch (e) {
      console.error('Failed to fetch project', e);
      return null;
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string | null;
      tsxContent?: string;
      cssContent?: string;
    }
  ): Promise<ApiProjectFull | null> {
    try {
      const { projectFull } = this.db.schema;
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (body.name !== undefined) updateData.name = body.name;
      if (body.description !== undefined)
        updateData.description = body.description;
      if (body.tsxContent !== undefined)
        updateData.tsxContent = body.tsxContent;
      if (body.cssContent !== undefined)
        updateData.cssContent = body.cssContent;

      const [updated] = await this.db.drizzle
        .update(projectFull)
        .set(updateData)
        .where(eq(projectFull.id, Number(id)))
        .returning();

      return {
        id: updated.id,
        slug: updated.slug,
        name: updated.name,
        description: updated.description,
        type: updated.type,
        tsxContent: updated.tsxContent,
        cssContent: updated.cssContent,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    } catch (e) {
      console.error('Failed to update project', e);
      throw e;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const { projectFull } = this.db.schema;
      await this.db.drizzle
        .delete(projectFull)
        .where(eq(projectFull.id, Number(id)));
      return { success: true };
    } catch (e) {
      console.error('Failed to delete project', e);
      throw e;
    }
  }
}
