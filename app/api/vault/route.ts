// app/api/vault/route.ts
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

import { connect } from '../../lib/db';
import VaultItem from '../../lib/models/VaultItem';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET not set');

interface VaultRequestData {
  id?: string;
  ciphertext: string;
  iv: string;
  salt: string;
}

interface JwtPayload {
  id: string;
}

async function getUserId(req: Request): Promise<string | null> {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;

  try {
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
    return payload.id ?? null;
  } catch (err) {
    return null;
  }
}

// GET /api/vault
export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connect();
  const items = await VaultItem.find({ owner: userId }).sort({ createdAt: -1 });
  return NextResponse.json(items);
}

// POST /api/vault
export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data: VaultRequestData = await req.json();
  await connect();

  const item = new VaultItem({
    owner: userId,
    ciphertext: data.ciphertext,
    iv: data.iv,
    salt: data.salt,
  });

  await item.save();
  return NextResponse.json(item);
}

// PUT /api/vault
export async function PUT(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data: VaultRequestData = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });

  await connect();
  const item = await VaultItem.findOne({ _id: data.id, owner: userId });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  item.ciphertext = data.ciphertext;
  item.iv = data.iv;
  item.salt = data.salt;
  await item.save();

  return NextResponse.json(item);
}

// DELETE /api/vault
export async function DELETE(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data: { id?: string } = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });

  await connect();
  const item = await VaultItem.findOneAndDelete({ _id: data.id, owner: userId });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
