import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { outdatedDependencies, repositoryOf } from '../update-server'

function writeJson(file: string, value: unknown) {
  mkdirSync(join(file, '..'), { recursive: true })
  writeFileSync(file, JSON.stringify(value))
}

describe('update check', () => {
  it('reads owner/name from https and ssh GitHub remotes alike', () => {
    expect(repositoryOf('https://github.com/woolimi/robotics-roadmap')).toBe('woolimi/robotics-roadmap')
    expect(repositoryOf('https://github.com/woolimi/robotics-roadmap.git')).toBe('woolimi/robotics-roadmap')
    expect(repositoryOf('git@github.com:Woolimi/Robotics-Roadmap.git')).toBe('woolimi/robotics-roadmap')
    expect(repositoryOf('git@github.com:someone/robotics-roadmap.git')).toBe('someone/robotics-roadmap')
    expect(repositoryOf('/local/path')).toBeNull()
  })

  it('asks for npm install when an update adds or upgrades a dependency', () => {
    const root = mkdtempSync(join(tmpdir(), 'roadmap-update-'))
    writeJson(join(root, 'site/package.json'), { dependencies: { kept: '^1.0.0', upgraded: '^2.0.0' }, devDependencies: { added: '^1.0.0' } })
    writeJson(join(root, 'site/package-lock.json'), {
      packages: {
        'node_modules/kept': { version: '1.0.0' },
        'node_modules/upgraded': { version: '2.0.0' },
        'node_modules/added': { version: '1.0.0' },
      },
    })
    writeJson(join(root, 'site/node_modules/kept/package.json'), { version: '1.0.0' })
    writeJson(join(root, 'site/node_modules/upgraded/package.json'), { version: '1.4.0' })
    expect(outdatedDependencies(root).sort()).toEqual(['added', 'upgraded'])
  })

  it('finds nothing to install in this checkout', () => {
    expect(outdatedDependencies(join(__dirname, '../..'))).toEqual([])
  })
})
