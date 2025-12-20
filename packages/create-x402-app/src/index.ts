#!/usr/bin/env node

import { program } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import prompts from 'prompts'
import fs from 'fs-extra'
import path from 'path'
import { execSync } from 'child_process'
import figlet from 'figlet'

const packageJson = require('../package.json')

type ProjectType = 'fullstack' | 'backend'
type Framework = 'hono' | 'express'
type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun'

interface ProjectOptions {
  name: string
  projectType: ProjectType
  framework: Framework
  packageManager: PackageManager
  installDeps: boolean
}

function getTemplateDir(projectType: ProjectType, framework: Framework): string {
  return `${projectType}-${framework}`
}

function getTemplatesDirectory(): string {
  // When installed as a package, __dirname points to dist/
  // Templates are at the package root level (one level up from dist/)
  const possiblePaths = [
    path.join(__dirname, '..', 'templates'), // When installed as package (most common)
    path.join(__dirname, 'templates'), // When running from source
  ]
  
  // Try direct paths first
  for (const templatePath of possiblePaths) {
    if (fs.existsSync(templatePath)) {
      return templatePath
    }
  }
  
  // If not found, search up the directory tree for package.json
  let currentDir = __dirname
  let attempts = 0
  const maxAttempts = 10 // Prevent infinite loop
  
  while (attempts < maxAttempts) {
    const pkgPath = path.join(currentDir, 'package.json')
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = fs.readJsonSync(pkgPath)
        if (pkg.name === 'create-x402-app') {
          const templatesPath = path.join(currentDir, 'templates')
          if (fs.existsSync(templatesPath)) {
            return templatesPath
          }
        }
      } catch (e) {
        // Continue searching
      }
    }
    
    const parentDir = path.dirname(currentDir)
    if (parentDir === currentDir) {
      break // Reached filesystem root
    }
    currentDir = parentDir
    attempts++
  }
  
  // Last resort: try common npx cache locations
  const npxPaths = [
    path.join(process.env.HOME || process.env.USERPROFILE || '', '.npm', '_npx', 'templates'),
    path.join(process.cwd(), 'node_modules', 'create-x402-app', 'templates'),
  ]
  
  for (const templatePath of npxPaths) {
    if (fs.existsSync(templatePath)) {
      return templatePath
    }
  }
  
  throw new Error(`Could not find templates directory. Searched from: ${__dirname}`)
}

function showBanner(): Promise<void> {
  return new Promise((resolve) => {
    figlet.text('x402', {
      font: 'ANSI Shadow',
      horizontalLayout: 'default',
      verticalLayout: 'default',
    }, (err, data) => {
      console.log()
      if (!err && data) {
        // Add gradient effect with colors
        const lines = data.split('\n')
        const colors = [chalk.hex('#00D4FF'), chalk.hex('#00BFFF'), chalk.hex('#00A5FF'), chalk.hex('#008BFF'), chalk.hex('#0070FF'), chalk.hex('#0055FF'), chalk.hex('#003AFF')]
        lines.forEach((line, i) => {
          const color = colors[Math.min(i, colors.length - 1)]
          console.log(color(line))
        })
      } else {
        console.log(chalk.bold.cyan('  x402'))
      }
      console.log()
      console.log(chalk.bold.white('  mantle-sdk'))
      console.log()
      console.log(chalk.gray('  ╭─────────────────────────────────────────────────────╮'))
      console.log(chalk.gray('  │'), chalk.cyan(' Build pay-per-request APIs with HTTP 402 protocol '), chalk.gray('│'))
      console.log(chalk.gray('  │'), chalk.white('           Powered by Mantle Network                '), chalk.gray('│'))
      console.log(chalk.gray('  ╰─────────────────────────────────────────────────────╯'))
      console.log()
      console.log(chalk.gray(`  v${packageJson.version}`))
      console.log()
      resolve()
    })
  })
}

async function main() {
  // Show ASCII banner first
  await showBanner()

  program
    .name('create-x402-app')
    .description('Create a new x402 pay-per-request API project')
    .version(packageJson.version)
    .argument('[project-name]', 'Name of your project')
    .option('--fullstack', 'Create a fullstack project')
    .option('--backend', 'Create a backend-only project')
    .option('--hono', 'Use Hono framework')
    .option('--express', 'Use Express framework')
    .option('--npm', 'Use npm as package manager')
    .option('--yarn', 'Use yarn as package manager')
    .option('--pnpm', 'Use pnpm as package manager')
    .option('--bun', 'Use bun as package manager')
    .option('--skip-install', 'Skip installing dependencies')
    .parse()

  const args = program.args
  const options = program.opts()

  let projectName = args[0]
  let projectType: ProjectType | undefined
  let framework: Framework | undefined
  let packageManager: PackageManager = 'npm'
  let installDeps = !options.skipInstall

  // Determine options from flags
  if (options.fullstack) projectType = 'fullstack'
  if (options.backend) projectType = 'backend'
  if (options.hono) framework = 'hono'
  if (options.express) framework = 'express'

  let packageManagerFromFlag = false
  if (options.npm) { packageManager = 'npm'; packageManagerFromFlag = true }
  else if (options.yarn) { packageManager = 'yarn'; packageManagerFromFlag = true }
  else if (options.pnpm) { packageManager = 'pnpm'; packageManagerFromFlag = true }
  else if (options.bun) { packageManager = 'bun'; packageManagerFromFlag = true }

  // Step 1: Ask for project name first
  if (!projectName) {
    const { name } = await prompts({
      type: 'text',
      name: 'name',
      message: 'What is your project name?',
      initial: 'my-x402-app',
      validate: (value: string) => {
        if (!value) return 'Project name is required'
        if (!/^[a-z0-9-_]+$/i.test(value)) {
          return 'Project name can only contain letters, numbers, hyphens, and underscores'
        }
        return true
      },
    }, {
      onCancel: () => {
        console.log(chalk.red('\n✖ Project creation cancelled.'))
        process.exit(1)
      },
    })
    projectName = name
  }

  // Step 2: Ask for project type
  if (!projectType) {
    const { type } = await prompts({
      type: 'select',
      name: 'type',
      message: 'What type of project?',
      choices: [
        {
          title: 'Fullstack',
          value: 'fullstack',
          description: 'Next.js frontend + API routes with x402'
        },
        {
          title: 'Backend only',
          value: 'backend',
          description: 'Standalone API server with x402'
        },
      ],
      initial: 0,
    }, {
      onCancel: () => {
        console.log(chalk.red('\n✖ Project creation cancelled.'))
        process.exit(1)
      },
    })
    projectType = type
  }

  // Step 3: Ask for framework
  if (!framework) {
    const { fw } = await prompts({
      type: 'select',
      name: 'fw',
      message: 'Which framework?',
      choices: [
        {
          title: 'Hono',
          value: 'hono',
          description: 'Fast, lightweight, Web Standards'
        },
        {
          title: 'Express',
          value: 'express',
          description: 'Popular, mature, extensive ecosystem'
        },
      ],
      initial: 0,
    }, {
      onCancel: () => {
        console.log(chalk.red('\n✖ Project creation cancelled.'))
        process.exit(1)
      },
    })
    framework = fw
  }

  // Step 4: Ask for package manager and install preference
  if (!packageManagerFromFlag) {
    const response = await prompts([
      {
        type: 'select',
        name: 'packageManager',
        message: 'Package manager:',
        choices: [
          { title: 'npm', value: 'npm' },
          { title: 'yarn', value: 'yarn' },
          { title: 'pnpm', value: 'pnpm' },
          { title: 'bun', value: 'bun' },
        ],
        initial: 0,
      },
      {
        type: 'confirm',
        name: 'installDeps',
        message: 'Install dependencies?',
        initial: true,
      }
    ], {
      onCancel: () => {
        console.log(chalk.red('\n✖ Project creation cancelled.'))
        process.exit(1)
      },
    })
    packageManager = response.packageManager
    installDeps = response.installDeps
  }

  if (!projectName || !projectType || !framework) {
    console.log(chalk.red('\n✖ Missing required options.'))
    process.exit(1)
  }

  const projectPath = path.resolve(process.cwd(), projectName)
  const templateName = getTemplateDir(projectType, framework)

  // Show selection summary
  console.log()
  console.log(chalk.bold('  Project Configuration'))
  console.log(chalk.gray('  ─────────────────────'))
  console.log(chalk.gray('  Name:     '), chalk.cyan(projectName))
  console.log(chalk.gray('  Type:     '), chalk.white(projectType))
  console.log(chalk.gray('  Framework:'), chalk.white(framework))
  console.log(chalk.gray('  Package:  '), chalk.white(packageManager))
  console.log()

  // Check if directory already exists
  if (fs.existsSync(projectPath)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Directory ${chalk.cyan(projectName)} already exists. Overwrite?`,
      initial: false,
    })

    if (!overwrite) {
      console.log(chalk.red('\n✖ Project creation cancelled.'))
      process.exit(1)
    }

    fs.removeSync(projectPath)
  }

  // Create project
  const spinner = ora('Creating project...').start()

  try {
    // Find templates directory
    const templatesDir = getTemplatesDirectory()
    const templatePath = path.join(templatesDir, templateName)

    if (!fs.existsSync(templatePath)) {
      spinner.fail(`Template not found: ${templateName}`)
      console.log(chalk.yellow(`\nAvailable templates:`))
      if (fs.existsSync(templatesDir)) {
        const templates = fs.readdirSync(templatesDir)
        templates.forEach(t => console.log(chalk.gray(`  • ${t}`)))
      } else {
        console.log(chalk.red(`Templates directory not found at: ${templatesDir}`))
        console.log(chalk.yellow(`__dirname: ${__dirname}`))
      }
      process.exit(1)
    }

    fs.copySync(templatePath, projectPath)

    // Update package.json with project name
    const pkgPath = path.join(projectPath, 'package.json')
    if (fs.existsSync(pkgPath)) {
      const pkg = fs.readJsonSync(pkgPath)
      pkg.name = projectName
      fs.writeJsonSync(pkgPath, pkg, { spaces: 2 })
    }

    // Rename gitignore (npm ignores .gitignore in packages)
    const gitignoreVariants = ['_gitignore', 'gitignore']
    for (const variant of gitignoreVariants) {
      const gitignorePath = path.join(projectPath, variant)
      if (fs.existsSync(gitignorePath)) {
        fs.renameSync(gitignorePath, path.join(projectPath, '.gitignore'))
        break
      }
    }

    // Rename env.example to .env.example
    const envExampleVariants = ['_env.example', 'env.example']
    for (const variant of envExampleVariants) {
      const envExamplePath = path.join(projectPath, variant)
      if (fs.existsSync(envExamplePath)) {
        fs.renameSync(envExamplePath, path.join(projectPath, '.env.example'))
        break
      }
    }

    spinner.succeed('Project created!')

    // Install dependencies
    if (installDeps) {
      const installSpinner = ora('Installing dependencies...').start()

      try {
        const installCmd = {
          npm: 'npm install',
          yarn: 'yarn',
          pnpm: 'pnpm install',
          bun: 'bun install',
        }[packageManager]

        execSync(installCmd, {
          cwd: projectPath,
          stdio: 'pipe',
        })

        installSpinner.succeed('Dependencies installed!')
      } catch (error) {
        installSpinner.fail('Failed to install dependencies')
        console.log(chalk.yellow('\nYou can install them manually:'))
        console.log(chalk.cyan(`  cd ${projectName}`))
        console.log(chalk.cyan(`  ${packageManager} install`))
      }
    }

    // Success message
    const runCmd = packageManager === 'npm' ? 'npm run' : packageManager

    console.log()
    console.log(chalk.green.bold('✔ Success!'), `Created ${chalk.cyan(projectName)}`)
    console.log()
    console.log(chalk.bold('  Next steps:'))
    console.log()
    console.log(chalk.gray('  1.'), chalk.cyan(`cd ${projectName}`))
    if (!installDeps) {
      console.log(chalk.gray('  2.'), chalk.cyan(`${packageManager} install`))
      console.log(chalk.gray('  3.'), chalk.cyan('cp .env.example .env'))
      console.log(chalk.gray('  4.'), 'Get your App ID from', chalk.underline('https://mantle-x402.vercel.app'))
      console.log(chalk.gray('  5.'), chalk.cyan(`${runCmd} dev`))
    } else {
      console.log(chalk.gray('  2.'), chalk.cyan('cp .env.example .env'))
      console.log(chalk.gray('  3.'), 'Get your App ID from', chalk.underline('https://mantle-x402.vercel.app'))
      console.log(chalk.gray('  4.'), chalk.cyan(`${runCmd} dev`))
    }
    console.log()
    console.log(chalk.gray('  Documentation:'), chalk.underline('https://mantle-x402.vercel.app'))
    console.log()
  } catch (error) {
    spinner.fail('Failed to create project')
    console.error(error)
    process.exit(1)
  }
}

main().catch(console.error)
