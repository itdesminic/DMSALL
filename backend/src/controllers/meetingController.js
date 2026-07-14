import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();

export async function listRooms(req,res){
  const rooms = await prisma.meetingRoom.findMany();
  res.json(rooms);
}

export async function requestRoom(req,res){
  const { roomId, start, end, participants, topic } = req.body;
  const userId = req.user.userId;
  if(!roomId || !start || !end) return res.status(400).json({ error: 'Faltan datos' });

  const overlap = await prisma.meetingRoomRequest.findFirst({
    where: {
      roomId,
      AND: [
        { start: { lt: new Date(end) } },
        { end: { gt: new Date(start) } }
      ]
    }
  });
  if(overlap) return res.status(400).json({ error: 'La sala ya está reservada en ese horario' });
  const reqDb = await prisma.meetingRoomRequest.create({ data: { roomId, userId, start: new Date(start), end: new Date(end), status: 'requested' } });
  res.json(reqDb);
}
