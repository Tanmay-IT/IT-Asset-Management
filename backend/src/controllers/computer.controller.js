import * as computerService from '../services/computer.service.js';

export async function getComputers(req, res, next) {
  try {
    const computers = await computerService.listComputers();
    res.json(computers);
  } catch (err) {
    next(err);
  }
}

export async function postComputer(req, res, next) {
  try {
    const computer = await computerService.createComputer(req.body);
    res.status(201).json(computer);
  } catch (err) {
    next(err);
  }
}

export async function putComputer(req, res, next) {
  try {
    const computer = await computerService.updateComputer(req.params.id, req.body);
    if (!computer) {
      return res.status(404).json({ message: 'Computer not found' });
    }
    res.json(computer);
  } catch (err) {
    next(err);
  }
}

export async function deleteComputer(req, res, next) {
  try {
    const computer = await computerService.deleteComputer(req.params.id);
    if (!computer) {
      return res.status(404).json({ message: 'Computer not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
