#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';

const moduleName = process.argv[2];
if (!moduleName) {
  console.error(
    '❌ Please specify a module name. Example: yarn module:create farm',
  );
  process.exit(1);
}

const basePath = `src/modules/${moduleName}`;
const entitiesPath = `${basePath}/entity`;

// ✨ Use helper functions
const className = toClassName(moduleName);
const camelName = toCamelCase(moduleName);
const snakeName = toSnakeCase(moduleName);

const entityName = `${className}Entity`;
const serviceName = `${className}Service`;
const controllerName = `${className}Controller`;

console.log(`🚀 Generating NestJS module: ${moduleName}...`);

// 1️⃣ Generate module (no test)
execSync(`npx nest g module modules/${moduleName} --no-spec`, {
  stdio: 'inherit',
});

// 2️⃣ Generate service (no test)
execSync(`npx nest g service modules/${moduleName} --no-spec`, {
  stdio: 'inherit',
});

// 3️⃣ Generate controller (no test)
execSync(`npx nest g controller modules/${moduleName} --no-spec`, {
  stdio: 'inherit',
});

// 4️⃣ Create entity folder
if (!fs.existsSync(entitiesPath)) {
  fs.mkdirSync(entitiesPath, { recursive: true });
  console.log(`📁 Created folder: ${entitiesPath}`);
}

// 5️⃣ Generate entity file
const entityFile = `${entitiesPath}/${moduleName}.entity.ts`;
if (!fs.existsSync(entityFile)) {
  const entityContent = `import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: '${snakeName}s' })
export class ${entityName} {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_${snakeName}s_id' })
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;
}
`;
  fs.writeFileSync(entityFile, entityContent);
  console.log(`✅ Created entity: ${entityFile}`);
}

// 6️⃣ Update service file
const serviceFile = `${basePath}/${moduleName}.service.ts`;
if (fs.existsSync(serviceFile)) {
  const serviceContent = `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${entityName} } from './entity/${moduleName}.entity';

@Injectable()
export class ${serviceName} {
  constructor(
    @InjectRepository(${entityName})
    private readonly ${camelName}Repo: Repository<${entityName}>,
  ) {}

  async findAll() {
    return this.${camelName}Repo.find();
  }
}
`;
  fs.writeFileSync(serviceFile, serviceContent);
  console.log(`✅ Updated service: ${serviceFile}`);
}

// 7️⃣ Update controller file
const controllerFile = `${basePath}/${moduleName}.controller.ts`;
if (fs.existsSync(controllerFile)) {
  const controllerContent = `import { Controller, Get } from '@nestjs/common';
import { ${serviceName} } from './${moduleName}.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';

@ApiBearerAuth()
@ApiTags('${className}')
@Controller('${moduleName}s')
export class ${controllerName} {
  constructor(
    private readonly ${camelName}Service: ${serviceName},
    private readonly clsService: ClsService,
  ) {}

  @Get()
  async findAll() {
    return this.${camelName}Service.findAll();
  }
}
`;
  fs.writeFileSync(controllerFile, controllerContent);
  console.log(`✅ Updated controller: ${controllerFile}`);
}

// 8️⃣ Update module file
const moduleFile = `${basePath}/${moduleName}.module.ts`;
if (fs.existsSync(moduleFile)) {
  const moduleContent = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { ${entityName} } from './entity/${moduleName}.entity';
import { ${controllerName} } from './${moduleName}.controller';
import { ${serviceName} } from './${moduleName}.service';

@Module({
  imports: [TypeOrmModule.forFeature([${entityName}]), ClsModule],
  providers: [${serviceName}],
  controllers: [${controllerName}],
})
export class ${className}Module {}
`;
  fs.writeFileSync(moduleFile, moduleContent);
  console.log(`✅ Updated module: ${moduleFile}`);
}

console.log(`🎉 Module "${moduleName}" created successfully!`);

// 🔠 Helper functions
function toCamelCase(str) {
  const parts = str.split('-');
  if (parts.length === 1) return parts[0];
  return parts
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');
}

function toClassName(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toSnakeCase(str) {
  return str
    .replace(/-/g, '_')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();
}
