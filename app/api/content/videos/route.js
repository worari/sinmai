// app/api/content/videos/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const videos = db.getVideos();
    return NextResponse.json({ success: true, videos });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุชื่อคลิปวิดีโอ' }, { status: 400 });
    }
    const newVideo = db.createVideo(body);
    return NextResponse.json({ success: true, message: 'เพิ่มคลิปวิดีโอสำเร็จ', video: newVideo });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสวิดีโอที่ต้องการแก้ไข' }, { status: 400 });
    }
    const updated = db.updateVideo(id, updateData);
    return NextResponse.json({ success: true, message: 'แก้ไขข้อมูลวิดีโอสำเร็จ', video: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสวิดีโอที่ต้องการลบ' }, { status: 400 });
    }
    db.deleteVideo(id);
    return NextResponse.json({ success: true, message: 'ลบวิดีโอสำเร็จ' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
