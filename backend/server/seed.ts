import mongoose from 'mongoose';

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/webdoctruyen');
  console.log('Connected to MongoDB');

  // Category schema
  const categorySchema = new mongoose.Schema(
    { name: String, slug: String, comicCount: { type: Number, default: 0 } },
    { timestamps: true },
  );
  const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

  const categoryNames = ['Action', 'Fantasy', 'Comedy', 'Romance', 'Manhua', 'Manhwa', 'Martial Arts', 'Adventure'];
  const catDocs: any[] = [];
  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const doc = await Category.findOneAndUpdate({ slug }, { name, slug }, { upsert: true, new: true });
    catDocs.push(doc);
  }
  console.log(`Seeded ${catDocs.length} categories`);

  // Comic schema
  const comicSchema = new mongoose.Schema(
    {
      title: String,
      slug: { type: String, unique: true },
      otherNames: [String],
      description: String,
      coverUrl: String,
      author: String,
      artist: String,
      categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
      country: { type: String, enum: ['manga', 'manhua', 'manhwa', 'comic'] },
      status: { type: String, enum: ['ongoing', 'completed', 'dropped'], default: 'ongoing' },
      totalChapters: { type: Number, default: 0 },
      latestChapter: { number: Number, title: String, updatedAt: Date },
      views: {
        total: { type: Number, default: 0 },
        daily: { type: Number, default: 0 },
        weekly: { type: Number, default: 0 },
        monthly: { type: Number, default: 0 },
      },
      rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      followers: { type: Number, default: 0 },
      sourceUrl: { type: String, default: '' },
      isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
  );
  const Comic = mongoose.models.Comic || mongoose.model('Comic', comicSchema);

  // Chapter schema
  const chapterSchema = new mongoose.Schema({
    comicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comic' },
    number: Number,
    title: String,
    slug: String,
    pages: [{ pageNumber: Number, imageUrl: String, width: Number, height: Number }],
    views: { type: Number, default: 0 },
    sourceUrl: String,
    createdAt: { type: Date, default: Date.now },
  });
  const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', chapterSchema);

  const comics = [
    {
      title: 'Đại Quản Gia Là Ma Hoàng',
      slug: 'dai-quan-gia-la-ma-hoang',
      description: 'Câu chuyện về một ma hoàng trở thành quản gia cho một gia đình quý tộc. Hắn phải che giấu thân phận thật sự trong khi bảo vệ gia đình khỏi các thế lực hắc ám.',
      author: 'Unknown',
      country: 'manhua' as const,
      status: 'ongoing' as const,
      coverUrl: 'https://placehold.co/300x400/4f46e5/white?text=DQGLMH',
      categories: [catDocs[0]._id, catDocs[1]._id, catDocs[4]._id],
      views: { total: 15420, daily: 230, weekly: 1200, monthly: 5400 },
      rating: { average: 4.2, count: 156 },
      followers: 890,
      sourceUrl: 'https://truyenqqno.com/truyen-tranh/dai-quan-gia-la-ma-hoang',
    },
    {
      title: 'Ta Trọng Sinh Là Nhân Vật Phản Diện',
      slug: 'ta-trong-sinh-la-nhan-vat-phan-dien',
      description: 'Xuyên không vào thế giới tiểu thuyết và trở thành nhân vật phản diện. Để sống sót, hắn phải thay đổi cốt truyện gốc và tìm cách thoát khỏi số phận.',
      author: 'Lục Nguyệt',
      country: 'manhua' as const,
      status: 'ongoing' as const,
      coverUrl: 'https://placehold.co/300x400/7c3aed/white?text=TTSLNVPD',
      categories: [catDocs[0]._id, catDocs[1]._id, catDocs[6]._id],
      views: { total: 23100, daily: 450, weekly: 2800, monthly: 9200 },
      rating: { average: 4.5, count: 234 },
      followers: 1560,
      sourceUrl: 'https://truyenqqno.com/truyen-tranh/ta-trong-sinh-la-nhan-vat-phan-dien',
    },
    {
      title: 'One Punch Man',
      slug: 'one-punch-man',
      description: 'Saitama, một anh hùng có thể đánh bại bất kỳ đối thủ nào chỉ với một cú đấm. Nhưng sức mạnh tuyệt đối lại mang đến sự nhàm chán vô tận.',
      author: 'ONE / Murata Yusuke',
      country: 'manga' as const,
      status: 'ongoing' as const,
      coverUrl: 'https://placehold.co/300x400/dc2626/white?text=OPM',
      categories: [catDocs[0]._id, catDocs[2]._id, catDocs[7]._id],
      views: { total: 89500, daily: 1200, weekly: 7800, monthly: 28000 },
      rating: { average: 4.8, count: 1205 },
      followers: 8900,
      sourceUrl: 'https://truyenqqno.com/truyen-tranh/one-punch-man',
    },
    {
      title: 'Sakamoto Days',
      slug: 'sakamoto-days',
      description: 'Sakamoto từng là sát thủ hàng đầu, giờ sống cuộc đời bình yên với gia đình. Nhưng quá khứ không dễ buông bỏ.',
      author: 'Suzuki Yuto',
      country: 'manga' as const,
      status: 'ongoing' as const,
      coverUrl: 'https://placehold.co/300x400/ea580c/white?text=Sakamoto',
      categories: [catDocs[0]._id, catDocs[2]._id],
      views: { total: 45200, daily: 780, weekly: 4500, monthly: 16000 },
      rating: { average: 4.6, count: 567 },
      followers: 3400,
      sourceUrl: 'https://truyenqqno.com/truyen-tranh/sakamoto-days',
    },
    {
      title: 'Ta Trùng Sinh Thành Liêu Đột Biến',
      slug: 'ta-trung-sinh-thanh-lieu-dot-bien',
      description: 'Trùng sinh thành một loài đột biến và bắt đầu hành trình tiến hóa từ sinh vật yếu ớt thành tồn tại mạnh nhất.',
      author: 'Tam Phúc',
      country: 'manhua' as const,
      status: 'ongoing' as const,
      coverUrl: 'https://placehold.co/300x400/059669/white?text=TTSTLDB',
      categories: [catDocs[1]._id, catDocs[7]._id, catDocs[4]._id],
      views: { total: 12800, daily: 180, weekly: 950, monthly: 4100 },
      rating: { average: 4.0, count: 98 },
      followers: 620,
      sourceUrl: 'https://truyenqqno.com/truyen-tranh/ta-trung-sinh-thanh-lieu-dot-bien',
    },
  ];

  for (const c of comics) {
    const totalChapters = Math.floor(Math.random() * 150) + 20;
    const latestNum = totalChapters;
    const comic = await Comic.findOneAndUpdate(
      { slug: c.slug },
      {
        ...c,
        totalChapters,
        latestChapter: { number: latestNum, title: `Chapter ${latestNum}`, updatedAt: new Date() },
      },
      { upsert: true, new: true },
    );

    // Create 3 sample chapters per comic
    for (let i = 1; i <= 3; i++) {
      const chNum = latestNum - 3 + i;
      await Chapter.findOneAndUpdate(
        { comicId: comic._id, number: chNum },
        {
          comicId: comic._id,
          number: chNum,
          title: `Chapter ${chNum}`,
          slug: `chapter-${chNum}`,
          pages: Array.from({ length: 10 }, (_, j) => ({
            pageNumber: j + 1,
            imageUrl: `https://placehold.co/800x1200/1a1a2e/white?text=${c.slug}+Ch${chNum}+P${j + 1}`,
            width: 800,
            height: 1200,
          })),
          views: Math.floor(Math.random() * 1000),
        },
        { upsert: true, new: true },
      );
    }
  }

  console.log(`Seeded ${comics.length} comics with 3 chapters each`);

  // Create a CrawlSource for TruyenQQ
  const crawlSourceSchema = new mongoose.Schema({
    name: String,
    baseUrl: String,
    selectors: mongoose.Schema.Types.Mixed,
    headers: mongoose.Schema.Types.Mixed,
    schedule: String,
    isActive: Boolean,
    lastCrawlAt: Date,
    lastError: String,
    stats: { totalCrawled: Number, totalErrors: Number, lastSuccessAt: Date },
    createdAt: { type: Date, default: Date.now },
  });
  const CrawlSource = mongoose.models.CrawlSource || mongoose.model('CrawlSource', crawlSourceSchema);

  await CrawlSource.findOneAndUpdate(
    { name: 'TruyenQQ' },
    {
      name: 'TruyenQQ',
      baseUrl: 'https://truyenqqno.com',
      selectors: {},
      headers: {},
      schedule: '*/30 * * * *',
      isActive: true,
      lastCrawlAt: null,
      lastError: '',
      stats: { totalCrawled: 0, totalErrors: 0, lastSuccessAt: null },
    },
    { upsert: true, new: true },
  );
  console.log('Seeded CrawlSource: TruyenQQ (truyenqqno.com)');

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(console.error);
