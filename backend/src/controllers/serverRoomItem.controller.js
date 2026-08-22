import * as serverRoomItemService from '../services/serverRoomItem.service.js';

export async function getServerRoomItems(req, res, next) {
  try {
    const items = await serverRoomItemService.listServerRoomItems();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function postServerRoomItem(req, res, next) {
  try {
    const item = await serverRoomItemService.createServerRoomItem(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function putServerRoomItem(req, res, next) {
  try {
    const item = await serverRoomItemService.updateServerRoomItem(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ message: 'Server room item not found' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function deleteServerRoomItem(req, res, next) {
  try {
    const item = await serverRoomItemService.deleteServerRoomItem(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Server room item not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
