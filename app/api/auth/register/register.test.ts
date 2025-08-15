import { describe, it, expect, vi } from 'vitest'
import { POST } from './route'
import { getAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

// Mock de NextResponse
vi.spyOn(NextResponse, 'json').mockImplementation((body: any, init?: ResponseInit) => {
  return {
    json: () => Promise.resolve(body),
    status: init?.status || 200,
    headers: new Headers(init?.headers),
    ok: (init?.status || 200) < 300,
  } as any
})

// Mock del cliente de Supabase Admin
vi.mock('@/lib/supabase-admin', () => ({
  getAdminClient: vi.fn(),
}))

const mockAdminClient = {
  auth: {
    admin: {
      createUser: vi.fn(),
    },
  },
  from: vi.fn(),
}

describe('API Register Endpoint', () => {
  it('should register a user successfully', async () => {
    // Configurar mocks para un registro exitoso
    vi.mocked(getAdminClient).mockReturnValue(mockAdminClient as any)
    vi.mocked(mockAdminClient.auth.admin.createUser).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })
    const fromMock = vi.mocked(mockAdminClient.from)
    fromMock.mockImplementation((tableName: string) => {
      if (tableName === 'members') {
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'member-456' }, error: null }),
        } as any
      }
      if (tableName === 'churches') {
        return {
          select: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'church-789' }, error: null }),
        } as any
      }
      if (tableName === 'roles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'role-abc' }, error: null }),
        } as any
      }
      if (tableName === 'user_roles') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        } as any
      }
      return {} as any
    })

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
  })

  it('should return 400 if required fields are missing', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }), // Faltan password y name
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('email, password, and name are required')
  })
})
