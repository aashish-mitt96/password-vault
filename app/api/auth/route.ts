import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

import { connect } from '../../lib/db';
import User from '../../lib/models/User';


const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';


export async function POST(req: Request) {
  const data = await req.json();
  await connect();

  if (data.action === 'signup') {
    const { email, password } = data;
    const exists = await User.findOne({ email });
    if (exists) return NextResponse.json({ error: 'Email exists' }, { status: 400 });
    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({ email, passwordHash: hash });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
    return NextResponse.json({ token });
  }

  if (data.action === 'login') {
    const { email, password } = data;
    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: 'Invalid' }, { status: 401 });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: 'Invalid' }, { status: 401 });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    return NextResponse.json({ token });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}