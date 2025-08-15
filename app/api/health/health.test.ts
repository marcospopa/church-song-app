import { describe, it, expect, vi } from 'vitest'
import { GET } from './route'
import { NextResponse } from 'next/server'

// Mock de NextResponse para acceder a los datos JSON
vi.spyOn(NextResponse, 'json').mockImplementation((body: any) => {
  return {
    json: () => Promise.resolve(body),
    status: 200,
    headers: new Headers(),
    ok: true,
    statusText: 'OK',
    redirect: () => new Response(),
    clone: () => new Response(),
    type: 'default',
    url: '',
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(''),
  } as any
})

// Mock de los módulos de base de datos
vi.mock('@/lib/database', () => ({
  testConnection: vi.fn(),
  dashboardApi: {
    getStats: vi.fn(),
  },
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => ({
          error: null,
        })),
      })),
    })),
  },
}))

describe('API Health Check', () => {
  it('should return a healthy status when everything is ok', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-key')

    const { testConnection, dashboardApi } = await import('@/lib/database')
    const { supabase } = await import('@/lib/supabase')

    // Configurar mocks para el caso "todo ok"
    vi.mocked(testConnection).mockResolvedValue(true)
    vi.mocked(dashboardApi.getStats).mockResolvedValue({
      totalSongs: 10,
      totalMembers: 5,
      totalSetlists: 2,
      upcomingEvents: 1,
    })
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ error: null }),
    } as any)

    const response = await GET()
    const data = await response.json()

    expect(data.env.envOk).toBe(true)
    expect(data.connected).toBe(true)
    expect(data.schemaOk).toBe(true)
    expect(data.stats).toEqual({
      totalSongs: 10,
      totalMembers: 5,
      totalSetlists: 2,
      upcomingEvents: 1,
    })
  })
})
