import * as tonerInwardService from '../services/tonerInward.service.js';

export async function getTonerInward(req, res, next) {
  try {
    res.json(await tonerInwardService.listTonerInward());
  } catch (err) {
    next(err);
  }
}

export async function postTonerInward(req, res, next) {
  try {
    const item = await tonerInwardService.createTonerInward(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function putTonerInward(req, res, next) {
  try {
    const item = await tonerInwardService.updateTonerInward(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: 'Toner inward entry not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function deleteTonerInward(req, res, next) {
  try {
    const item = await tonerInwardService.deleteTonerInward(req.params.id);
    if (!item) return res.status(404).json({ message: 'Toner inward entry not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
