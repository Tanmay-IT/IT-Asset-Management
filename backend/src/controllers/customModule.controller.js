import * as customModuleService from '../services/customModule.service.js';

export async function getModules(req, res, next) {
  try {
    const modules = await customModuleService.listModules();
    res.json(modules);
  } catch (err) {
    next(err);
  }
}

export async function postModule(req, res, next) {
  try {
    const name = (req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'A name is required.' });
    }
    const module = await customModuleService.createModule(name);
    res.status(201).json(module);
  } catch (err) {
    next(err);
  }
}

export async function deleteModuleHandler(req, res, next) {
  try {
    const module = await customModuleService.deleteModule(req.params.slug);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function postColumn(req, res, next) {
  try {
    const label = (req.body.label || '').trim();
    if (!label) {
      return res.status(400).json({ message: 'A column name is required.' });
    }
    const module = await customModuleService.addColumn(req.params.slug, label);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    res.status(201).json(module);
  } catch (err) {
    next(err);
  }
}

export async function getRecords(req, res, next) {
  try {
    const module = await customModuleService.getModuleBySlug(req.params.slug);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    const records = await customModuleService.listRecords(req.params.slug);
    res.json({ module, records });
  } catch (err) {
    next(err);
  }
}

export async function postRecord(req, res, next) {
  try {
    const module = await customModuleService.getModuleBySlug(req.params.slug);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    const record = await customModuleService.createRecord(req.params.slug, req.body.data || {});
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
}

export async function putRecord(req, res, next) {
  try {
    const record = await customModuleService.updateRecord(req.params.id, req.body.data || {});
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json(record);
  } catch (err) {
    next(err);
  }
}

export async function deleteRecord(req, res, next) {
  try {
    const record = await customModuleService.deleteRecord(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
