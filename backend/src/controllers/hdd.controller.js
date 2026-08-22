import * as hddService from '../services/hdd.service.js';

export async function getDashboard(req, res, next) {
  try {
    res.json(await hddService.getDashboardStats());
  } catch (err) {
    next(err);
  }
}

export async function getInventory(req, res, next) {
  try {
    const entities = await hddService.listHddEntities();
    res.json(entities);
  } catch (err) {
    next(err);
  }
}

export async function getManifest(req, res, next) {
  try {
    res.json(hddService.getWorkbookManifest());
  } catch (err) {
    next(err);
  }
}

export async function getMainRecord(req, res, next) {
  try {
    const main = await hddService.getMainRecordById(req.params.id);
    if (!main) {
      return res.status(404).json({ message: 'HDD record not found' });
    }
    const detailSheets = await hddService.findDetailSheetsForMain(main._id);
    res.json({ main, detailSheets });
  } catch (err) {
    next(err);
  }
}

export async function getDetailSheet(req, res, next) {
  try {
    const detail = await hddService.getDetailSheetById(req.params.id);
    if (!detail) {
      return res.status(404).json({ message: 'HDD detail sheet not found' });
    }
    res.json(detail);
  } catch (err) {
    next(err);
  }
}

export async function postMainRecord(req, res, next) {
  try {
    const main = await hddService.createMainRecord(req.body);
    res.status(201).json(main);
  } catch (err) {
    next(err);
  }
}

export async function putMainRecord(req, res, next) {
  try {
    const main = await hddService.updateMainRecord(req.params.id, req.body);
    if (!main) {
      return res.status(404).json({ message: 'HDD record not found' });
    }
    res.json(main);
  } catch (err) {
    next(err);
  }
}

export async function postDetailSheet(req, res, next) {
  try {
    const { mainRecordId, ...data } = req.body;
    if (!mainRecordId) {
      return res.status(400).json({ message: 'mainRecordId is required' });
    }
    const detail = await hddService.createDetailSheetForMain(mainRecordId, data);
    if (!detail) {
      return res.status(404).json({ message: 'Main record not found' });
    }
    res.status(201).json(detail);
  } catch (err) {
    next(err);
  }
}

export async function putDetailSheet(req, res, next) {
  try {
    const detail = await hddService.updateDetailSheet(req.params.id, req.body);
    if (!detail) {
      return res.status(404).json({ message: 'HDD detail sheet not found' });
    }
    res.json(detail);
  } catch (err) {
    next(err);
  }
}

export async function search(req, res, next) {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q : '';
    const results = await hddService.searchHdd(query);
    res.json({ query, results });
  } catch (err) {
    next(err);
  }
}
