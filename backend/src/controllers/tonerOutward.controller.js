import * as tonerOutwardService from '../services/tonerOutward.service.js';

export async function getTonerOutward(req, res, next) {
  try {
    res.json(await tonerOutwardService.listTonerOutward());
  } catch (err) {
    next(err);
  }
}

export async function postTonerOutward(req, res, next) {
  try {
    const item = await tonerOutwardService.createTonerOutward(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function putTonerOutward(req, res, next) {
  try {
    const item = await tonerOutwardService.updateTonerOutward(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: 'Toner outward entry not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function deleteTonerOutward(req, res, next) {
  try {
    const item = await tonerOutwardService.deleteTonerOutward(req.params.id);
    if (!item) return res.status(404).json({ message: 'Toner outward entry not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
