export default async function handler(req: any, res: any) {
  res.status(200).json({ message: "Users route is live" });
}