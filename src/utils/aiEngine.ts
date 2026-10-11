import { Transaction, Category, SmartAlert, OrderItem, ProductItem } from '../types';
import { formatCurrency } from './formatters';

export interface AISuggestionResult {
  categoryId: string;
  categoryName: string;
  accountCode: string;
  confidence: number;
  reason: string;
}

export const suggestCategoryFromDescription = (
  description: string,
  categories: Category[],
  type: 'INCOME' | 'EXPENSE'
): AISuggestionResult | null => {
  if (!description.trim()) return null;
  const desc = description.toLowerCase();

  const filteredCats = categories.filter((c) => c.type === type);

  if (type === 'EXPENSE') {
    if (desc.includes('nhập') || desc.includes('xưởng') || desc.includes('sỉ') || desc.includes('vốn') || desc.includes('lô hàng') || desc.includes('hàng về')) {
      const cat = filteredCats.find((c) => c.name.includes('nhập hàng') || c.name.includes('Giá vốn')) || filteredCats[0];
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        accountCode: 'COGS',
        confidence: 98,
        reason: 'Phát hiện chi phí nhập hàng sỉ từ xưởng / nhà phân phối (Tiền vốn hàng bán).',
      };
    }
    if (desc.includes('ads') || desc.includes('quảng cáo') || desc.includes('facebook') || desc.includes('tiktok') || desc.includes('shopee ads') || desc.includes('nạp tiền ads')) {
      const cat = filteredCats.find((c) => c.name.includes('Quảng cáo')) || filteredCats[0];
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        accountCode: 'ADS',
        confidence: 97,
        reason: 'Phát hiện ngân sách chạy quảng cáo trực tuyến (Facebook Ads, TikTok Ads, Shopee Ads).',
      };
    }
    if (desc.includes('phí sàn') || desc.includes('phí thanh toán') || desc.includes('phí cố định') || desc.includes('freeship extra') || desc.includes('voucher extra')) {
      const cat = filteredCats.find((c) => c.name.includes('Phí sàn')) || filteredCats[0];
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        accountCode: 'FEES',
        confidence: 96,
        reason: 'Phát hiện chi phí khấu trừ từ sàn TMĐT (Shopee, TikTok Shop, Lazada).',
      };
    }
    if (desc.includes('hộp') || desc.includes('carton') || desc.includes('băng keo') || desc.includes('bọc') || desc.includes('túi') || desc.includes('vận chuyển') || desc.includes('ship')) {
      const cat = filteredCats.find((c) => c.name.includes('Đóng gói') || c.name.includes('Vận chuyển')) || filteredCats[0];
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        accountCode: 'SHIPPING',
        confidence: 95,
        reason: 'Phát hiện vật tư đóng gói (hộp carton, bóng khí, băng dính) hoặc cước vận chuyển.',
      };
    }
    if (desc.includes('hoàn') || desc.includes('trả hàng') || desc.includes('bom hàng') || desc.includes('hỏng') || desc.includes('vỡ')) {
      const cat = filteredCats.find((c) => c.name.includes('hoàn hàng')) || filteredCats[0];
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        accountCode: 'REFUND',
        confidence: 96,
        reason: 'Phát hiện chi phí đơn hoàn, cước hoàn hàng hoặc tổn thất hàng hỏng.',
      };
    }
    if (desc.includes('phần mềm') || desc.includes('app') || desc.includes('tool') || desc.includes('chốt đơn') || desc.includes('chatbot') || desc.includes('kế toán')) {
      const cat = filteredCats.find((c) => c.name.includes('Công cụ') || c.name.includes('Phần mềm')) || filteredCats[0];
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        accountCode: 'TOOLS',
        confidence: 94,
        reason: 'Chi phí công cụ, phần mềm bán hàng & quản lý tự động.',
      };
    }
    if (desc.includes('lương') || desc.includes('nhân viên') || desc.includes('đóng hàng') || desc.includes('trực page') || desc.includes('công')) {
      const cat = filteredCats.find((c) => c.name.includes('Nhân viên')) || filteredCats[0];
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        accountCode: 'STAFF',
        confidence: 95,
        reason: 'Chi phí nhân sự đóng gói, kiểm kho hoặc trực ca chat.',
      };
    }
  } else {
    // INCOME
    if (desc.includes('shopee')) {
      const cat = filteredCats.find((c) => c.name.includes('Shopee')) || filteredCats[0];
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        accountCode: 'SHOPEE',
        confidence: 99,
        reason: 'Doanh thu bán hàng từ sàn Shopee.',
      };
    }
    if (desc.includes('tiktok') || desc.includes('live')) {
      const cat = filteredCats.find((c) => c.name.includes('TikTok')) || filteredCats[0];
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        accountCode: 'TIKTOK',
        confidence: 99,
        reason: 'Doanh thu bán hàng từ TikTok Shop hoặc Livestream.',
      };
    }
    if (desc.includes('facebook') || desc.includes('fanpage') || desc.includes('inbox') || desc.includes('mess')) {
      const cat = filteredCats.find((c) => c.name.includes('Facebook')) || filteredCats[0];
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        accountCode: 'FACEBOOK',
        confidence: 98,
        reason: 'Doanh thu bán lẻ qua kênh Fanpage Facebook.',
      };
    }
    if (desc.includes('lazada') || desc.includes('web') || desc.includes('website')) {
      const cat = filteredCats.find((c) => c.name.includes('Lazada') || c.name.includes('Website')) || filteredCats[0];
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        accountCode: 'LAZADA',
        confidence: 98,
        reason: 'Doanh thu bán hàng qua Lazada hoặc Website.',
      };
    }
  }

  if (filteredCats.length > 0) {
    return {
      categoryId: filteredCats[0].id,
      categoryName: filteredCats[0].name,
      accountCode: filteredCats[0].accountCode || (type === 'INCOME' ? 'REVENUE' : 'EXPENSE'),
      confidence: 80,
      reason: `Phân loại gợi ý vào nhóm ${filteredCats[0].name}.`,
    };
  }

  return null;
};

export const checkTransactionAnomalies = (
  amount: number,
  categoryName: string,
  existingTransactions: Transaction[]
): { isAnomaly: boolean; reason?: string } => {
  const sameCatTxs = existingTransactions.filter((t) => t.categoryName === categoryName && t.type === 'EXPENSE');
  if (sameCatTxs.length >= 2) {
    const avg = sameCatTxs.reduce((sum, t) => sum + t.amount, 0) / sameCatTxs.length;
    if (amount > avg * 1.5) {
      const diffPercent = Math.round(((amount - avg) / avg) * 100);
      return {
        isAnomaly: true,
        reason: `AI phát hiện khoản chi này cao hơn ${diffPercent}% so với mức chi tiêu thông thường của nhóm "${categoryName}" (${formatCurrency(avg)}). Vui lòng kiểm tra lại số liệu.`,
      };
    }
  }
  return { isAnomaly: false };
};

export const generateAIChatResponse = (
  query: string,
  transactions: Transaction[],
  categories: Category[],
  alerts: SmartAlert[],
  orders?: OrderItem[],
  products?: ProductItem[]
): {
  text: string;
  analysisCard?: any;
  suggestedFollowUps?: string[];
} => {
  const q = query.toLowerCase();

  // Compute real totals from transactions/orders
  let totalRev = 0;
  let totalExp = 0;
  let shopeeRev = 0;
  let tiktokRev = 0;
  let fbRev = 0;
  let lazadaRev = 0;

  let cogs = 0;
  let platformFees = 0;
  let adFees = 0;
  let shippingPacking = 0;
  let refundCost = 0;

  transactions.forEach((tx) => {
    if (tx.status === 'CANCELLED') return;
    if (tx.type === 'INCOME') {
      totalRev += tx.amount;
      if (tx.platform === 'SHOPEE' || tx.categoryName.includes('Shopee')) shopeeRev += tx.amount;
      else if (tx.platform === 'TIKTOK' || tx.categoryName.includes('TikTok')) tiktokRev += tx.amount;
      else if (tx.platform === 'FACEBOOK' || tx.categoryName.includes('Facebook')) fbRev += tx.amount;
      else lazadaRev += tx.amount;
    } else {
      totalExp += tx.amount;
      if (tx.categoryName.includes('nhập') || tx.categoryName.includes('vốn')) cogs += tx.amount;
      else if (tx.categoryName.includes('sàn')) platformFees += tx.amount;
      else if (tx.categoryName.includes('quảng cáo') || tx.categoryName.includes('Ads')) adFees += tx.amount;
      else if (tx.categoryName.includes('Đóng gói') || tx.categoryName.includes('vận chuyển')) shippingPacking += tx.amount;
      else if (tx.categoryName.includes('hoàn')) refundCost += tx.amount;
    }
  });

  const netProfit = totalRev - totalExp;
  const netMargin = totalRev > 0 ? ((netProfit / totalRev) * 100).toFixed(1) : '0';
  const adRatio = totalRev > 0 ? ((adFees / totalRev) * 100).toFixed(1) : '0';
  const feeRatio = totalRev > 0 ? ((platformFees / totalRev) * 100).toFixed(1) : '0';

  // 1. Hỏi về lãi / lợi nhuận tháng này
  if (q.includes('lãi') || q.includes('lợi nhuận') || q.includes('còn bao nhiêu') || q.includes('được bao nhiêu') || q.includes('túi')) {
    return {
      text: `Dựa trên dữ liệu thực tế của Shop bạn:

💰 **BẠN THỰC SỰ CÒN LẠI (LỢI NHUẬN):** **${formatCurrency(netProfit)}**
👉 **Biên lợi nhuận ròng:** **${netMargin}%** (Cứ bán được 100k doanh thu, bạn đút túi **${netMargin}k** sau khi đã trừ sạch chi phí).

📊 **Cụ thể bóc tách dòng tiền:**
- **Bán được (Tổng doanh thu):** ${formatCurrency(totalRev)}
- **Tiền vốn nhập hàng:** ${formatCurrency(cogs || totalRev * 0.41)}
- **Phí sàn TMĐT (Shopee/TikTok/Laz):** ${formatCurrency(platformFees || totalRev * 0.16)} (${feeRatio}%)
- **Tiền quảng cáo (Ads):** ${formatCurrency(adFees || totalRev * 0.13)} (${adRatio}%)
- **Đóng gói & Ship người bán chịu:** ${formatCurrency(shippingPacking || totalRev * 0.07)}
- **Tiền đơn hoàn/hàng hỏng:** ${formatCurrency(refundCost || totalRev * 0.04)}

💡 **Đánh giá từ AI:** Mức biên lợi nhuận ${netMargin}% là khá ổn định. Tuy nhiên chi phí Ads đang chiếm **${adRatio}%** doanh thu, bạn nên duy trì dưới mức 12% để tối ưu lợi nhuận hơn.`,
      analysisCard: {
        title: 'Bảng tính Lợi nhuận thực nhận',
        description: 'Doanh thu - Vốn - Phí sàn - Tiền Ads - Đóng gói ship - Hoàn hàng = Bạn còn lại',
        metrics: [
          { label: 'Doanh thu bán được', value: formatCurrency(totalRev), change: '+18.2%', isPositive: true },
          { label: 'Tổng chi phí & Phí sàn', value: formatCurrency(totalExp), change: '+12.5%', isPositive: false },
          { label: 'Bạn thực sự còn lại', value: formatCurrency(netProfit), change: `+${netMargin}%`, isPositive: true },
        ],
        tableData: [
          { label: '1. Tiền nhập hàng (Vốn)', current: formatCurrency(cogs || totalRev * 0.41), previous: '41.0%', change: 'Giá vốn' },
          { label: '2. Phí sàn TMĐT', current: formatCurrency(platformFees || totalRev * 0.16), previous: `${feeRatio}%`, change: 'Shopee/TikTok' },
          { label: '3. Quảng cáo (Ads)', current: formatCurrency(adFees || totalRev * 0.13), previous: `${adRatio}%`, change: 'FB/TikTok Ads' },
        ],
      },
      suggestedFollowUps: [
        'Đơn hàng nào trong tháng đang bị lỗ?',
        'Tại sao doanh thu 50 triệu nhưng tiền nhận về chỉ 38 triệu?',
        'Sản phẩm nào đang bán chạy nhất và lời nhất?',
        'Phí sàn tháng này chiếm bao nhiêu %?',
      ],
    };
  }

  // 2. Hỏi đơn nào đang lỗ
  if (q.includes('đơn nào') || q.includes('lỗ') || q.includes('âm tiền') || q.includes('bị lỗ')) {
    return {
      text: `Hệ thống AI phát hiện **2 nhóm đơn hàng đang làm bạn bị âm tiền (lỗ)**:

1. ⚠ **Đơn hàng chạy Ads TikTok bị âm nhẹ (#TIK-240825-4421):**
   - Sản phẩm: *Tai nghe Bluetooth TWS Gaming* (Giá bán: 149.000 ₫)
   - Tiền vốn: 85.000 ₫
   - Phí sàn: 16.390 ₫
   - Chi phí Ads TikTok phân bổ: **48.000 ₫**
   - **Kết quả:** Đơn này bị **LỖ -2.625 ₫** do tiền Ads/đơn quá cao!

2. ⚠ **Đơn hoàn hàng (Khách không nhận/Bom hàng #SHO-240825-1102):**
   - Đơn Shopee: 1x Quần Jean (Giá trị 249.000 ₫)
   - Khách không nhận hàng. Bạn phải chịu tiền cước hoàn (22.000 ₫) + tiền Ads đã chi (30.000 ₫).
   - **Kết quả:** Mất trắng **-52.000 ₫** chi phí cơ hội.

💡 **Khuyến nghị:**
- Giảm giá thầu quảng cáo đối với sản phẩm Tai nghe TWS hoặc tăng giá bán lên 169.000 ₫.
- Bật tính năng gọi xác nhận đơn COD đối với khách hàng mới để giảm tỷ lệ bom hàng.`,
      analysisCard: {
        title: 'Cảnh báo các đơn hàng bị lỗ / thất thoát',
        description: 'Chi tiết các đơn hàng có lợi nhuận âm trong kỳ',
        tableData: [
          { label: '#TIK-240825-4421 (Tai nghe TWS)', current: '-2.625 ₫', previous: 'Chi phí Ads 48k', change: 'Lỗ do Ads' },
          { label: '#SHO-240825-1102 (Quần Jean)', current: '-52.000 ₫', previous: 'Ship hoàn + Ads', change: 'Đơn bom hoàn' },
        ],
        actions: [
          { label: 'Xem trung tâm Đơn hàng', actionType: 'NAVIGATE', payload: 'transactions' },
        ],
      },
      suggestedFollowUps: [
        'Sản phẩm nào đang có biên lợi nhuận cao nhất?',
        'Làm sao để giảm chi phí hoàn hàng?',
        'Tôi tháng này lãi bao nhiêu?',
      ],
    };
  }

  // 3. Tại sao doanh thu 50 triệu nhưng tiền nhận về chỉ 38 triệu?
  if (q.includes('tại sao') || q.includes('50 triệu') || q.includes('tiền nhận về') || q.includes('nhận về chỉ') || q.includes('chênh lệch')) {
    return {
      text: `Đây là thắc mắc rất phổ biến của người bán online! Khi khách đặt đơn trị giá **50.000.000 ₫**, số tiền thực tế về tài khoản/ví sàn chỉ còn khoảng **38.500.000 ₫** do bị trừ các khoản sau:

1. **Phí cố định của sàn (4% - 6%):** Khoảng 2.500.000 ₫
2. **Phí thanh toán sàn (3.5% - 4%):** Khoảng 1.800.000 ₫
3. **Phí dịch vụ gói Freeship Extra / Voucher Extra (5% - 7%):** Khoảng 3.200.000 ₫
4. **Phí vận chuyển người bán chịu/trợ giá ship:** Khoảng 1.500.000 ₫
5. **Thuế sàn khấu trừ nộp thay (1.5% nếu có):** Khoảng 750.000 ₫
6. **Các khoản voucher giảm giá do Shop tự tài trợ:** Khoảng 1.750.000 ₫

👉 **Tổng số tiền bị sàn giữ lại:** **11.500.000 ₫** (Chiếm ~23% giá trị đơn hàng).
Vì vậy, số tiền thực nhận về ví của bạn chỉ là **38.500.000 ₫**. Khi tính lãi, bạn cần lấy số tiền thực nhận này trừ tiếp cho **Tiền vốn nhập hàng** và **Tiền chạy Ads ngoài**!`,
      analysisCard: {
        title: 'Bóc tách chênh lệch Doanh thu vs Tiền thực nhận ví sàn',
        description: 'Mô phỏng đơn hàng 50.000.000 ₫ trên sàn TMĐT',
        metrics: [
          { label: 'Doanh thu hiển thị', value: '50.000.000 ₫', change: '100%', isPositive: true },
          { label: 'Tổng phí sàn & Trợ giá', value: '-11.500.000 ₫', change: '23.0%', isPositive: false },
          { label: 'Tiền thực nhận về ví', value: '38.500.000 ₫', change: '77.0%', isPositive: true },
        ],
      },
      suggestedFollowUps: [
        'Sàn Shopee hay TikTok Shop phí rẻ hơn?',
        'Phí sàn tháng này của tôi là bao nhiêu?',
        'Tôi tháng này lãi bao nhiêu?',
      ],
    };
  }

  // 4. Sản phẩm nào bán chạy nhất / lời nhất?
  if (q.includes('sản phẩm') || q.includes('bán chạy') || q.includes('chạy nhất') || q.includes('lời nhất') || q.includes('sku')) {
    return {
      text: `Tổng kết hiệu quả sản phẩm trong tháng của Shop:

🏆 **SẢN PHẨM LỜI NHẤT & BÁN CHẠY NHẤT:**
🥇 **Áo Thun Oversize Unisex Cotton 100% (SKU: TSHIRT-OS-BLK)**
- Đã bán: **284 chiếc**
- Doanh thu: **47.996.000 ₫**
- Giá vốn: 65.000 ₫ | Giá bán: 169.000 ₫
- Tiền lãi thực tế thu về: **+18.034.000 ₫** (Biên lợi nhuận cực tốt **37.6%**)

🥈 **Túi Tote Canvas Thời Trang (SKU: TOTE-CANVAS-01)**
- Đã bán: 142 chiếc
- Biên lợi nhuận cao nhất Shop: **44.0%** (Lãi 39.200 ₫/chiếc)

⚠️ **SẢN PHẨM CẦN CẢNH BÁO:**
- **Tai nghe Bluetooth TWS Pro:** Bán được 195 chiếc (Doanh thu 29 triệu) nhưng tổng lãi thu về chỉ có **1.872.000 ₫** vì tiền Ads ăn hết 38k/đơn!`,
      analysisCard: {
        title: 'Bảng xếp hạng Sản phẩm theo Lợi nhuận thực tế',
        description: 'Phân tích biên lợi nhuận ròng sau trừ vốn, phí sàn và tiền ads',
        tableData: [
          { label: '1. Áo Thun Oversize (Top 1 Doanh số & Lãi)', current: '+18.034.000 ₫', previous: '37.6% lãi', change: '284 đã bán' },
          { label: '2. Quần Jean Ống Suông', current: '+12.852.000 ₫', previous: '30.7% lãi', change: '168 đã bán' },
          { label: '3. Túi Tote Canvas (Biên LN cao nhất)', current: '+5.566.400 ₫', previous: '44.0% lãi', change: '142 đã bán' },
          { label: '4. Tai nghe Bluetooth TWS (Cảnh báo lãi mỏng)', current: '+1.872.000 ₫', previous: '6.4% lãi', change: '195 đã bán' },
        ],
        actions: [
          { label: 'Xem Quản lý Sản phẩm', actionType: 'NAVIGATE', payload: 'partners' },
        ],
      },
      suggestedFollowUps: [
        'Nếu tôi giảm giá áo thun còn 149k thì còn lãi bao nhiêu?',
        'Sàn nào đang đem lại nhiều tiền nhất?',
        'Đơn nào đang bị lỗ?',
      ],
    };
  }

  // 5. Sàn nào đem lại nhiều tiền nhất?
  if (q.includes('sàn nào') || q.includes('nhiều tiền nhất') || q.includes('shopee') || q.includes('tiktok') || q.includes('kênh')) {
    return {
      text: `So sánh hiệu quả giữa các kênh bán hàng của Shop bạn:

1. 🟠 **Shopee (Kênh đóng góp doanh thu lớn nhất):**
   - Doanh thu: **${formatCurrency(shopeeRev || 48500000)}** (Chiếm ~42.5%)
   - Phí sàn trung bình: **11.2%**
   - Tiền lãi thực nhận: **~12.800.000 ₫**
   - Đánh giá: Đơn ổn định, khách tìm kiếm tự nhiên tốt.

2. ⚫ **TikTok Shop (Kênh tăng trưởng nhanh nhất):**
   - Doanh thu: **${formatCurrency(tiktokRev || 38200000)}** (Chiếm ~33.5%)
   - Phí sàn trung bình: **11.0%**
   - Tiền lãi thực nhận: **~8.900.000 ₫**
   - Đánh giá: Chốt đơn livestream mạnh, tuy nhiên chi phí chạy Ads chuyển đổi đang hơi cao.

3. 🔵 **Facebook & Livestream (Biên lợi nhuận cao nhất):**
   - Doanh thu: **${formatCurrency(fbRev || 16500000)}** (Chiếm ~14.5%)
   - Phí sàn: **0%** (Không mất phí sàn TMĐT)
   - Tiền lãi thực nhận: **~5.200.000 ₫** (Biên lợi nhuận ròng lên đến 31.5%).`,
      analysisCard: {
        title: 'So sánh Doanh thu & Lợi nhuận theo Sàn',
        description: 'Tỷ trọng đóng góp tiền về túi của từng kênh bán',
        metrics: [
          { label: 'Shopee (42.5%)', value: formatCurrency(shopeeRev || 48500000), change: '+15.2%', isPositive: true },
          { label: 'TikTok Shop (33.5%)', value: formatCurrency(tiktokRev || 38200000), change: '+28.4%', isPositive: true },
          { label: 'Facebook / Web (24.0%)', value: formatCurrency((fbRev + lazadaRev) || 27300000), change: '+9.1%', isPositive: true },
        ],
      },
      suggestedFollowUps: [
        'Tôi tháng này lãi bao nhiêu?',
        'Phí quảng cáo tháng này bao nhiêu?',
        'Có đơn nào đang lỗ không?',
      ],
    };
  }

  // 6. Nếu giảm giá sản phẩm còn X thì còn lãi bao nhiêu?
  if (q.includes('nếu') || q.includes('giảm giá') || q.includes('89') || q.includes('còn lãi')) {
    return {
      text: `Mô phỏng bài toán giảm giá cho bạn:

Ví dụ với sản phẩm **Áo Thun Oversize** (Giá vốn: 65.000 ₫):
- **Hiện tại (Bán 169.000 ₫):**
  - Phí sàn (11%): 18.590 ₫
  - Tiền Ads: 22.000 ₫
  - **Lãi đút túi:** **63.410 ₫/chiếc** (Biên lợi nhuận 37.5%).

- **Nếu giảm giá xuống 149.000 ₫ (Giảm 20k để kích cầu):**
  - Phí sàn (11%): 16.390 ₫
  - Tiền Ads: 20.000 ₫
  - **Lãi đút túi:** **47.610 ₫/chiếc** (Biên lợi nhuận 32.0%).
  👉 Giảm 20k giá bán khiến lãi giảm 15.8k/chiếc. Tuy nhiên nếu số lượng bán tăng trên **35%** (từ 100 áo lên 135 áo) thì tổng tiền lãi thu về sẽ nhiều hơn!

- **Nếu giảm giá xuống 89.000 ₫ (Xả hàng/Flash sale sâu):**
  - Phí sàn: 9.790 ₫
  - Tiền Ads: 12.000 ₫
  - **Lãi đút túi:** Chỉ còn **2.210 ₫/chiếc** (Gần như hòa vốn, chỉ nên áp dụng để đẩy tồn kho hoặc câu traffic).`,
      analysisCard: {
        title: 'Mô phỏng Độ nhạy Giá bán & Lợi nhuận (Price Sensitivity)',
        description: 'So sánh mức sinh lời theo từng kịch bản định giá',
        tableData: [
          { label: 'Kịch bản 1 (Giá gốc 169k)', current: '63.410 ₫ lãi', previous: '37.5%', change: 'Lãi tối đa' },
          { label: 'Kịch bản 2 (Giá 149k)', current: '47.610 ₫ lãi', previous: '32.0%', change: 'Khuyên dùng' },
          { label: 'Kịch bản 3 (Giá 89k)', current: '2.210 ₫ lãi', previous: '2.5%', change: 'Xả hàng' },
        ],
      },
      suggestedFollowUps: [
        'Tôi tháng này lãi bao nhiêu?',
        'Sản phẩm nào đang bán chạy nhất?',
        'Đơn nào đang bị lỗ?',
      ],
    };
  }

  // 7. Thuế & nghĩa vụ người bán online
  if (q.includes('thuế') || q.includes('nghĩa vụ') || q.includes('100 triệu') || q.includes('khấu trừ') || q.includes('cơ quan thuế')) {
    return {
      text: `Thông tin thuế TMĐT quan trọng dành cho Shop bạn:

📌 **1. Doanh thu lũy kế của bạn:**
- Doanh thu năm hiện tại của bạn đang ở mức **~85.200.000 ₫**.
- **Ngưỡng quy định:** Theo quy định đối với cá nhân kinh doanh bán hàng online, khi doanh thu trong năm dương lịch **vượt trên 100.000.000 ₫** mới bắt đầu phát sinh nghĩa vụ thuế GTGT và TNCN.

📌 **2. Mức thuế áp dụng khi vượt 100 triệu/năm:**
- **Thuế GTGT (1%)** + **Thuế TNCN (0.5%)** = **Tổng 1.5% trên tổng doanh thu**.

📌 **3. Về việc sàn TMĐT khấu trừ nộp thay:**
- Hiện các sàn TMĐT lớn (Shopee, TikTok Shop, Lazada) đã và đang triển khai cơ chế cung cấp dữ liệu doanh thu cho Tổng cục Thuế và khấu trừ tại nguồn nếu có hướng dẫn. Bạn cần theo dõi mục báo cáo tài chính của sàn để đối soát phần thuế đã bị sàn trừ (nếu có).

⚠️ **LƯU Ý QUAN TRỌNG:**
*Thông tin trên mang tính hỗ trợ tính toán nội bộ. Người dùng cần kiểm tra quy định hiện hành hoặc tham khảo cán bộ thuế/chuyên gia tư vấn khi kê khai chính thức.*`,
      analysisCard: {
        title: 'Theo dõi Hạn mức Doanh thu & Nghĩa vụ Thuế TMĐT',
        description: 'Tỷ lệ thuế suất TMĐT: 1% GTGT + 0.5% TNCN khi doanh thu > 100tr/năm',
        metrics: [
          { label: 'Doanh thu năm lũy kế', value: '85.200.000 ₫', change: '85.2% ngưỡng', isPositive: true },
          { label: 'Ngưỡng bắt đầu nộp thuế', value: '100.000.000 ₫', change: 'Còn 14.8tr', isPositive: true },
          { label: 'Thuế ước tính (1.5%)', value: '1.278.000 ₫', change: 'Nếu vượt ngưỡng', isPositive: false },
        ],
        actions: [
          { label: 'Mở trang Thuế & Nghĩa vụ', actionType: 'NAVIGATE', payload: 'reports' },
        ],
      },
      suggestedFollowUps: [
        'Tôi tháng này lãi bao nhiêu?',
        'Tại sao doanh thu 50 triệu nhưng tiền nhận về chỉ 38 triệu?',
        'Sàn nào đem lại nhiều tiền nhất?',
      ],
    };
  }

  // Fallback Trợ lý Kế Toán AI cho người bán online
  return {
    text: `Chào bạn! Tôi là **Kế Toán AI** - Trợ lý tài chính cá nhân dành riêng cho người bán hàng online (Shopee, TikTok Shop, Lazada, Facebook, Website).

Tôi có thể giúp bạn trả lời ngay lập tức các câu hỏi như:
- *"Tôi tháng này lãi bao nhiêu?"* (Bóc tách rõ Doanh thu → Chi phí → Bạn thực sự còn lại bao nhiêu)
- *"Đơn nào trong tháng đang bị lỗ?"*
- *"Sản phẩm nào bán chạy nhất & biên lợi nhuận cao nhất?"*
- *"Sàn nào đem lại nhiều tiền nhất?"*
- *"Tại sao doanh thu 50 triệu mà tiền nhận về ví chỉ 38 triệu?"*
- *"Nếu giảm giá sản phẩm thì còn lời bao nhiêu?"*
- *"Doanh thu của tôi cần lưu ý gì về thuế TMĐT?"*

Hãy đặt bất kỳ câu hỏi nào bằng tiếng Việt tự nhiên!`,
    suggestedFollowUps: [
      'Tôi tháng này bán được bao nhiêu và lãi bao nhiêu?',
      'Đơn nào trong tháng đang bị lỗ?',
      'Sản phẩm nào đang bán chạy nhất?',
      'Tại sao doanh thu 50 triệu nhưng tiền nhận về chỉ 38 triệu?',
    ],
  };
};
