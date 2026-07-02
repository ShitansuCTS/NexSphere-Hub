import { NextResponse } from "next/server";

import {
  createWardController,
  getWardsController,
} from "@/controllers/ward/ward.controller";

export async function POST(request) {
  try {
    const body = await request.json();

    const response = await createWardController(body);

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error) {
    console.error("CREATE WARD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const query = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      villageId: searchParams.get("villageId"),
      nacId: searchParams.get("nacId"),
    };

    const response = await getWardsController(query);

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error) {
    console.error("GET WARDS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}