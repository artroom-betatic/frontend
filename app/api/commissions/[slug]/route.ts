import { getCommissionOffer } from "@/lib/catalog-data";

type CommissionRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: CommissionRouteContext) {
  const { slug } = await params;
  const commission = getCommissionOffer(decodeURIComponent(slug));

  if (!commission) {
    return Response.json(
      { message: "커미션 상품을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return Response.json({ commission });
}
