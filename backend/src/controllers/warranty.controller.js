import * as warrantyService from '../services/warranty.service.js';

export async function getWarranties(req, res, next) {
  try {
    const warranties = await warrantyService.listWarranties();
    res.json(warranties);
  } catch (err) {
    next(err);
  }
}

export async function postWarranty(req, res, next) {
  try {
    const warranty = await warrantyService.createWarranty(req.body);
    res.status(201).json(warranty);
  } catch (err) {
    next(err);
  }
}

export async function putWarranty(req, res, next) {
  try {
    const warranty = await warrantyService.updateWarranty(req.params.id, req.body);
    if (!warranty) {
      return res.status(404).json({ message: 'Warranty record not found' });
    }
    res.json(warranty);
  } catch (err) {
    next(err);
  }
}

export async function deleteWarranty(req, res, next) {
  try {
    const warranty = await warrantyService.deleteWarranty(req.params.id);
    if (!warranty) {
      return res.status(404).json({ message: 'Warranty record not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
