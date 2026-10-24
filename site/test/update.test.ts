import { describe, expect, it } from 'vitest'
import { repositoryOf } from '../update-server'

describe('update check', () => {
  it('reads owner/name from https and ssh GitHub remotes alike', () => {
    expect(repositoryOf('https://github.com/woolimi/robotics-roadmap')).toBe('woolimi/robotics-roadmap')
    expect(repositoryOf('https://github.com/woolimi/robotics-roadmap.git')).toBe('woolimi/robotics-roadmap')
    expect(repositoryOf('git@github.com:Woolimi/Robotics-Roadmap.git')).toBe('woolimi/robotics-roadmap')
    expect(repositoryOf('git@github.com:someone/robotics-roadmap.git')).toBe('someone/robotics-roadmap')
    expect(repositoryOf('/local/path')).toBeNull()
  })
})
