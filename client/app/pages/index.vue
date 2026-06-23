<script setup lang="ts">
definePageMeta({ layout: false });

const stats = [
  { value: '10.000+', label: 'Giáo viên sử dụng' },
  { value: '2.500+', label: 'Trung tâm tin dùng' },
  { value: '500k+', label: 'Học viên quản lý' },
  { value: '99%', label: 'Khách hàng hài lòng' },
];

const features = [
  {
    icon: 'mdi-clock-outline',
    title: 'Tiết kiệm 80% thời gian',
    desc: 'Không còn phải tổng hợp file Excel hay sổ sách thủ công. Mọi báo cáo tự động xuất ra trong 1 giây.',
  },
  {
    icon: 'mdi-account-group-outline',
    title: 'Quản lý tập trung 1 nơi',
    desc: 'Từ lịch dạy, học phí, điểm số đến tài liệu học tập đều nằm gọn trên một nền tảng duy nhất.',
  },
  {
    icon: 'mdi-school-outline',
    title: 'Tăng tương tác học viên',
    desc: 'Không gian học tập riêng biệt cho học viên giúp theo dõi lộ trình và nộp bài tập dễ dàng.',
  },
  {
    icon: 'mdi-shield-check-outline',
    title: 'Bảo mật dữ liệu tuyệt đối',
    desc: 'Dữ liệu trung tâm, học viên được lưu trữ an toàn trên nền tảng điện toán đám mây.',
  },
  {
    icon: 'mdi-cellphone',
    title: 'Sử dụng cực kỳ đơn giản',
    desc: 'Giao diện trực quan, thân thiện. Không rành công nghệ vẫn có thể thành thạo sau 15 phút.',
  },
  {
    icon: 'mdi-chart-line',
    title: 'Báo cáo tài chính rõ ràng',
    desc: 'Kiểm soát chính xác doanh thu, công nợ học phí. Tự động nhắc nhở khi đến hạn.',
  },
];

const scheduleBenefits = [
  'Hiển thị lịch học trực quan theo Ngày/Tuần/Tháng.',
  'Điểm danh nhanh chóng trên cả máy tính và điện thoại.',
  'Tự động tính toán số buổi nghỉ, đi trễ của học viên.',
  'Gửi thông báo nhắc nhở tự động trước khi lớp bắt đầu.',
];

const workspaceBenefits = [
  'Giao bài tập về nhà và đặt thời hạn (Deadline) dễ dàng.',
  'Học viên nộp bài trực tiếp lên hệ thống, giáo viên chấm điểm ngay lập tức.',
  'Quản lý kho tài liệu, giáo trình tập trung.',
  'Hệ thống tự động nhắc nhở học viên khi sắp đến hạn nộp bài.',
];

const footerGroups = [
  {
    title: 'Sản phẩm',
    links: ['Tính năng nổi bật', 'Bảng giá dịch vụ', 'Ứng dụng di động', 'Cập nhật mới'],
  },
  {
    title: 'Tài nguyên',
    links: ['Hướng dẫn sử dụng', 'Blog chia sẻ', 'Tài liệu biểu mẫu', 'Câu hỏi thường gặp'],
  },
  {
    title: 'Công ty',
    links: ['Về chúng tôi', 'Liên hệ hợp tác', 'Điều khoản dịch vụ', 'Chính sách bảo mật'],
  },
];
</script>

<template>
  <v-app>
    <main class="landing-page">
      <div class="topbar">
        <div class="topbar__left">
          <span><v-icon icon="mdi-phone-outline" size="14" /> Hotline: 0909 123 456</span>
          <span class="topbar__email"><v-icon icon="mdi-email-outline" size="14" /> Email: support@prepteacher.vn</span>
        </div>
        <div class="topbar__claim">
          Phần mềm quản lý lớp học và giảng dạy số 1 Việt Nam
        </div>
      </div>

      <header class="site-header">
        <div class="site-header__inner">
          <NuxtLink to="/" class="brand">
            <span class="brand__icon"><v-icon icon="mdi-calendar-check" size="24" /></span>
            <span>Prep<span class="brand__dark">Teacher</span></span>
          </NuxtLink>

          <nav class="main-nav" aria-label="Landing navigation">
            <a href="#" class="main-nav__link main-nav__link--active">Trang chủ</a>
            <a href="#features" class="main-nav__link">Tính năng</a>
            <a href="#pricing" class="main-nav__link">Bảng giá</a>
            <a href="#customers" class="main-nav__link">Khách hàng</a>
            <a href="#" class="main-nav__link">Hướng dẫn</a>
          </nav>

          <div class="site-header__actions">
            <NuxtLink to="/login" class="login-link">Đăng nhập</NuxtLink>
            <NuxtLink to="/register" class="trial-link">Dùng thử miễn phí</NuxtLink>
          </div>
        </div>
      </header>

      <section class="hero">
        <div class="texture texture--hero" />
        <div class="hero__inner">
          <div class="hero__copy">
            <div class="hero__badge">
              <span class="badge-dot"><span /><span /></span>
              Giải pháp tối ưu cho trung tâm & giáo viên
            </div>

            <h1>
              Phần mềm quản lý
              <br>
              <span>lớp học & học viên</span>
              <br>
              toàn diện nhất
            </h1>

            <p>
              Chấm dứt sổ sách cồng kềnh. PrepTeacher giúp bạn điểm danh, xếp lịch, giao bài tập và theo dõi học phí tự động chỉ trên 1 nền tảng duy nhất.
            </p>

            <div class="hero__actions">
              <NuxtLink to="/register" class="primary-cta">
                Đăng ký dùng thử
                <v-icon icon="mdi-arrow-right" size="20" />
              </NuxtLink>
              <button class="video-cta" type="button">
                <v-icon icon="mdi-play-circle-outline" size="24" />
                Xem Video Demo
              </button>
            </div>

            <div class="hero__checks">
              <span><v-icon icon="mdi-check-circle" size="18" /> Miễn phí 14 ngày</span>
              <span><v-icon icon="mdi-check-circle" size="18" /> Không cần thẻ Visa</span>
            </div>
          </div>

          <div class="hero__media">
            <div class="hero__glow" />
            <div class="hero__frame">
              <img
                src="https://images.unsplash.com/photo-1625297671662-f073f2a91528?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Phần mềm quản lý lớp học"
              >
            </div>
            <div class="attendance-card">
              <div class="attendance-card__icon"><v-icon icon="mdi-check" size="20" /></div>
              <div>
                <small>Điểm danh</small>
                <strong>Hoàn tất 100%</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="stats-band">
        <div class="stats-band__blob stats-band__blob--one" />
        <div class="stats-band__blob stats-band__blob--two" />
        <div class="stats-grid">
          <div v-for="(stat, index) in stats" :key="stat.label" :class="['stat-item', { 'stat-item--first': index === 0 }]">
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </div>
        </div>
      </section>

      <section id="features" class="features-section">
        <div class="section-inner">
          <div class="section-title">
            <h2>TẠI SAO CHỌN CHÚNG TÔI?</h2>
            <h3>Lợi ích tuyệt vời khi sử dụng PrepTeacher</h3>
            <p>
              Phần mềm được phát triển dựa trên quy trình nghiệp vụ thực tế, giải quyết đúng "nỗi đau" của các giáo viên và quản lý trung tâm.
            </p>
          </div>

          <div class="feature-grid">
            <article v-for="feature in features" :key="feature.title" class="feature-card">
              <div class="feature-card__icon">
                <v-icon :icon="feature.icon" size="28" />
              </div>
              <h4>{{ feature.title }}</h4>
              <p>{{ feature.desc }}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="showcase-section">
        <div class="section-inner">
          <div class="showcase-row">
            <div class="showcase-copy">
              <div class="showcase-copy__icon showcase-copy__icon--blue">
                <v-icon icon="mdi-calendar-check" size="24" />
              </div>
              <h2>Quản lý lịch dạy & Điểm danh thông minh</h2>
              <p>
                Loại bỏ hoàn toàn rủi ro trùng lịch, quên lịch. Theo dõi sát sao tình hình đi học của học viên với hệ thống điểm danh 1 chạm.
              </p>
              <ul>
                <li v-for="item in scheduleBenefits" :key="item">
                  <v-icon icon="mdi-check-circle" class="showcase-copy__check showcase-copy__check--orange" size="20" />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <div class="showcase-image showcase-image--blue">
              <img
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Quản lý lịch học"
              >
            </div>
          </div>

          <div class="showcase-row showcase-row--second">
            <div class="showcase-image showcase-image--orange">
              <img
                src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Góc học tập của học viên"
              >
            </div>

            <div class="showcase-copy">
              <div class="showcase-copy__icon showcase-copy__icon--orange">
                <v-icon icon="mdi-account-group-outline" size="24" />
              </div>
              <h2>Không gian học tập (Workspace) Độc quyền</h2>
              <p>
                Cung cấp cho học viên một "Góc học tập" chuyên nghiệp để theo dõi tiến độ, nộp bài tập và xem lại tài liệu bài giảng.
              </p>
              <ul>
                <li v-for="item in workspaceBenefits" :key="item">
                  <v-icon icon="mdi-check-circle" class="showcase-copy__check showcase-copy__check--blue" size="20" />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section class="final-cta">
        <div class="texture texture--final" />
        <div class="final-cta__glow" />
        <div class="final-cta__content">
          <h2>
            Chuyển đổi số lớp học của bạn
            <br>
            ngay hôm nay!
          </h2>
          <p>
            Hàng ngàn giáo viên đã thoát khỏi cảnh quản lý sổ sách bù đầu. Hãy để PrepTeacher đồng hành cùng bạn.
          </p>
          <NuxtLink to="/register">
            Đăng ký dùng thử miễn phí 14 ngày
          </NuxtLink>
          <small>Không yêu cầu thẻ tín dụng • Hỗ trợ cài đặt miễn phí 24/7</small>
        </div>
      </section>

      <footer class="site-footer">
        <div class="footer-grid">
          <div class="footer-about">
            <NuxtLink to="/" class="footer-brand">
              <span><v-icon icon="mdi-calendar-check" size="24" /></span>
              PrepTeacher
            </NuxtLink>
            <p>
              Giải pháp phần mềm quản lý lớp học, trung tâm ngoại ngữ và học viên toàn diện, dễ sử dụng nhất hiện nay.
            </p>
            <div class="footer-contact">
              <p><v-icon icon="mdi-phone-outline" size="18" /> 0909 123 456</p>
              <p><v-icon icon="mdi-email-outline" size="18" /> support@prepteacher.vn</p>
            </div>
          </div>

          <div v-for="group in footerGroups" :key="group.title" class="footer-group">
            <h4>{{ group.title }}</h4>
            <ul>
              <li v-for="link in group.links" :key="link">
                <a href="#">{{ link }}</a>
              </li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© 2026 PrepTeacher Vietnam. All rights reserved.</p>
          <div>
            <span>Facebook</span>
            <span>Youtube</span>
            <span>Tiktok</span>
          </div>
        </div>
      </footer>
    </main>
  </v-app>
</template>

<style scoped lang="scss">
$brand-blue: #0071f9;
$brand-orange: #ff6b00;
$slate-50: #f8fafc;
$slate-100: #f1f5f9;
$slate-200: #e2e8f0;
$slate-400: #94a3b8;
$slate-500: #64748b;
$slate-600: #475569;
$slate-700: #334155;
$slate-800: #1e293b;
$slate-900: #0f172a;
$content-max: 1280px;

@mixin content-shell {
  max-width: $content-max;
  margin: 0 auto;
  padding-inline: 32px;
}

@mixin center-flex {
  display: flex;
  align-items: center;
  justify-content: center;
}

.landing-page {
  min-height: 100vh;
  background: #fff;
  color: $slate-800;
  font-family: var(--st-font-family);

  :deep(.v-icon) {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    line-height: 1;
    vertical-align: middle;
  }
}

.topbar {
  min-height: 32px;
  background: $brand-blue;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 32px;
  font-size: 12px;
  line-height: 1.3;

  &__left,
  &__left span {
    display: flex;
    align-items: center;
    gap: 6px;
    line-height: 1;
  }

  &__left {
    gap: 24px;
  }

  &__claim {
    font-weight: 600;
  }
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #fff;
  border-bottom: 1px solid $slate-200;
  box-shadow: 0 1px 3px rgb(15 23 42 / 8%);

  &__inner {
    @include content-shell;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.brand,
.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: $brand-blue;
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0;
  text-decoration: none;
}

.brand {
  &__dark {
    color: $slate-800;
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: $brand-blue;
    color: #fff;
    @include center-flex;
    box-shadow: 0 8px 18px rgb(0 113 249 / 22%);
  }
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 32px;
  color: $slate-700;
  font-size: 14px;
  font-weight: 800;

  &__link {
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    color: inherit;
    line-height: 1;
    text-decoration: none;
    transition: color 160ms ease;

    &:hover,
    &--active {
      color: $brand-blue;
    }
  }
}

.login-link {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: $brand-blue;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 800;
  line-height: 1;
  text-decoration: none;

  &:hover {
    background: #eff6ff;
  }
}

.trial-link {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: $brand-orange;
  color: #fff;
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 800;
  line-height: 1;
  text-decoration: none;
  box-shadow: 0 12px 22px rgb(255 107 0 / 22%);
  transition: transform 160ms ease, background 160ms ease;

  &:hover {
    background: #ea580c;
    transform: translateY(-2px);
  }
}

.hero {
  position: relative;
  overflow: hidden;
  background: $slate-50;
  padding: 80px 0 112px;

  &__inner {
    @include content-shell;
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: center;
    gap: 48px;
  }

  &__copy {
    display: grid;
    justify-items: start;
    gap: 24px;
    padding-right: 32px;

    h1 {
      margin: 0;
      color: $slate-900;
      font-size: 60px;
      line-height: 1.15;
      font-weight: 900;
      letter-spacing: 0;

      span {
        color: transparent;
        background: linear-gradient(90deg, $brand-blue, #3b82f6);
        -webkit-background-clip: text;
        background-clip: text;
      }
    }

    > p {
      max-width: 672px;
      margin: 0;
      color: $slate-600;
      font-size: 18px;
      line-height: 1.65;
    }
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    border: 1px solid #fed7aa;
    border-radius: 999px;
    background: #ffedd5;
    color: $brand-orange;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 800;
    line-height: 1.2;
  }

  &__actions {
    display: flex;
    gap: 16px;
    padding-top: 16px;
  }

  &__checks {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-top: 24px;
    color: $slate-500;
    font-size: 14px;
    font-weight: 600;

    span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      line-height: 1.25;
    }

    :deep(.v-icon) {
      color: #22c55e;
    }
  }

  &__media {
    position: relative;
  }

  &__glow {
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: 999px;
    background: linear-gradient(45deg, $brand-blue, $brand-orange);
    opacity: 0.2;
    filter: blur(64px);
    transform: translate(40px, 40px);
  }

  &__frame {
    border: 1px solid $slate-200;
    border-radius: 20px;
    background: #fff;
    padding: 8px;
    box-shadow: 0 25px 70px rgb(15 23 42 / 22%);
    transform: rotate(1deg);
    transition: transform 500ms ease;

    &:hover {
      transform: rotate(0deg);
    }

    img {
      width: 100%;
      border-radius: 14px;
      object-fit: cover;
      display: block;
    }
  }
}

.texture {
  position: absolute;
  inset: 0;
  background-image: url("https://www.transparenttextures.com/patterns/diagonal-stripes.png");

  &--hero {
    opacity: 0.2;
  }

  &--final {
    opacity: 0.1;
  }
}

.badge-dot {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
  width: 10px;
  height: 10px;

  span:first-child {
    position: absolute;
    inset: 0;
    border-radius: 999px;
    background: #fb923c;
    animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  span:last-child {
    position: relative;
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: $brand-orange;
  }
}

.primary-cta,
.video-cta {
  box-sizing: border-box;
  min-height: 58px;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 16px 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
  transition: transform 160ms ease, background 160ms ease;
}

.primary-cta {
  background: $brand-blue;
  color: #fff;
  text-decoration: none;
  box-shadow: 0 18px 28px rgb(0 113 249 / 20%);

  &:hover {
    background: #0064df;
    transform: translateY(-4px);
  }
}

.video-cta {
  border: 2px solid $slate-200;
  background: #fff;
  color: $slate-700;
  font-family: inherit;
  cursor: pointer;

  :deep(.v-icon) {
    color: $brand-orange;
  }
}

.attendance-card {
  position: absolute;
  left: -24px;
  top: 25%;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid $slate-100;
  border-radius: 12px;
  background: #fff;
  padding: 16px;
  box-shadow: 0 20px 35px rgb(15 23 42 / 18%);
  animation: bounce 3s infinite;

  &__icon {
    width: 40px;
    height: 40px;
    flex: 0 0 40px;
    border-radius: 999px;
    background: #dcfce7;
    color: #16a34a;
    @include center-flex;
  }

  small {
    display: block;
    color: $slate-500;
    font-size: 12px;
    font-weight: 600;
  }

  strong {
    color: $slate-800;
    font-weight: 800;
  }
}

.stats-band {
  position: relative;
  overflow: hidden;
  background: $brand-blue;
  padding: 48px 0;

  &__blob {
    position: absolute;
    border-radius: 999px;
    filter: blur(40px);

    &--one {
      top: 0;
      right: 0;
      width: 256px;
      height: 256px;
      background: rgb(255 255 255 / 5%);
      transform: translate(33%, -50%);
    }

    &--two {
      left: 0;
      bottom: 0;
      width: 192px;
      height: 192px;
      background: rgb(255 107 0 / 20%);
      transform: translate(-25%, 50%);
    }
  }
}

.stats-grid {
  @include content-shell;
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  text-align: center;
}

.stat-item {
  border-left: 1px solid rgb(96 165 250 / 50%);

  &--first {
    border-left: 0;
  }

  strong {
    display: block;
    margin-bottom: 8px;
    color: #fff;
    font-size: 48px;
    line-height: 1;
    font-weight: 900;
  }

  span {
    color: #dbeafe;
    font-size: 16px;
    font-weight: 600;
  }
}

.features-section {
  background: #fff;
  padding: 96px 0;
}

.section-inner {
  @include content-shell;
}

.section-title {
  max-width: 768px;
  margin: 0 auto 64px;
  text-align: center;

  h2 {
    margin: 0 0 12px;
    color: $brand-orange;
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 0.08em;
  }

  h3 {
    margin: 0;
    color: $slate-900;
    font-size: 40px;
    line-height: 1.15;
    font-weight: 900;
    letter-spacing: 0;
  }

  p {
    margin: 24px 0 0;
    color: $slate-600;
    font-size: 18px;
    line-height: 1.6;
  }
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
}

.feature-card {
  border: 1px solid $slate-100;
  border-radius: 20px;
  background: $slate-50;
  padding: 32px;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;

  &:hover {
    border-color: rgb(0 113 249 / 30%);
    box-shadow: 0 20px 50px rgb(15 23 42 / 8%);
    transform: translateY(-2px);

    .feature-card__icon {
      background: $brand-blue;
      color: #fff;
      transform: scale(1.1);
    }
  }

  &__icon {
    width: 56px;
    height: 56px;
    flex: 0 0 56px;
    border: 1px solid $slate-100;
    border-radius: 12px;
    background: #fff;
    color: $brand-blue;
    @include center-flex;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgb(15 23 42 / 8%);
    transition: transform 180ms ease, background 180ms ease, color 180ms ease;
  }

  h4 {
    margin: 0 0 12px;
    color: $slate-900;
    font-size: 20px;
    font-weight: 900;
  }

  p {
    margin: 0;
    color: $slate-600;
    line-height: 1.65;
  }
}

.showcase-section {
  border-block: 1px solid $slate-200;
  background: $slate-50;
  padding: 96px 0;
}

.showcase-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
  gap: 64px;
  margin-bottom: 96px;

  &--second {
    margin-bottom: 0;
  }
}

.showcase-copy {
  &__icon {
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
    border-radius: 10px;
    @include center-flex;
    margin-bottom: 24px;

    &--blue {
      background: #dbeafe;
      color: $brand-blue;
    }

    &--orange {
      background: #ffedd5;
      color: $brand-orange;
    }
  }

  h2 {
    margin: 0;
    color: $slate-900;
    font-size: 40px;
    line-height: 1.15;
    font-weight: 900;
    letter-spacing: 0;
  }

  > p {
    margin: 24px 0 32px;
    color: $slate-600;
    font-size: 18px;
    line-height: 1.65;
  }

  ul {
    display: grid;
    gap: 20px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  li {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    color: $slate-700;
    font-weight: 700;
    line-height: 1.55;
  }

  &__check {
    width: 20px;
    height: 20px;
    flex: 0 0 20px;
    margin-top: 2px;

    &--orange {
      color: $brand-orange;
    }

    &--blue {
      color: $brand-blue;
    }
  }
}

.showcase-image {
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 20px;
    opacity: 0.1;
  }

  &--blue::before {
    background: $brand-blue;
    transform: rotate(3deg);
  }

  &--orange::before {
    background: $brand-orange;
    transform: rotate(-3deg);
  }

  img {
    position: relative;
    width: 100%;
    height: 400px;
    border-radius: 20px;
    object-fit: cover;
    display: block;
    box-shadow: 0 22px 55px rgb(15 23 42 / 18%);
  }
}

.final-cta {
  position: relative;
  overflow: hidden;
  background: $brand-blue;
  padding: 80px 0;

  &__glow {
    position: absolute;
    top: 0;
    right: 0;
    width: 384px;
    height: 384px;
    border-radius: 999px;
    background: rgb(255 107 0 / 20%);
    filter: blur(64px);
    transform: translate(33%, -50%);
  }

  &__content {
    position: relative;
    z-index: 1;
    max-width: 896px;
    margin: 0 auto;
    padding: 0 32px;
    text-align: center;

    h2 {
      margin: 0;
      color: #fff;
      font-size: 48px;
      line-height: 1.15;
      font-weight: 900;
      letter-spacing: 0;
    }

    p {
      max-width: 672px;
      margin: 24px auto 40px;
      color: #dbeafe;
      font-size: 20px;
      line-height: 1.55;
    }

    a {
      min-height: 68px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: $brand-orange;
      color: #fff;
      padding: 20px 40px;
      font-size: 20px;
      font-weight: 900;
      line-height: 1.2;
      text-align: center;
      text-decoration: none;
      box-shadow: 0 24px 50px rgb(124 45 18 / 45%);
      transition: transform 160ms ease, background 160ms ease;

      &:hover {
        background: #ea580c;
        transform: translateY(-4px);
      }
    }

    small {
      display: block;
      margin-top: 24px;
      color: #bfdbfe;
      font-size: 14px;
    }
  }
}

.site-footer {
  background: #111827;
  color: $slate-400;
  padding: 64px 0 0;
  font-weight: 600;
}

.footer-grid {
  @include content-shell;
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 48px 32px;
}

.footer-brand {
  color: #fff;
  margin-bottom: 24px;

  span {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: $brand-blue;
    color: #fff;
    @include center-flex;
  }
}

.footer-about {
  > p {
    max-width: 440px;
    margin: 0 0 24px;
    line-height: 1.65;
  }
}

.footer-contact {
  display: grid;
  gap: 12px;

  p {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    line-height: 1.35;
  }

  :deep(.v-icon) {
    color: $brand-blue;
  }
}

.footer-group {
  h4 {
    margin: 0 0 24px;
    color: #fff;
    font-size: 18px;
    font-weight: 900;
  }

  ul {
    display: grid;
    gap: 16px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      color: #fff;
    }
  }
}

.footer-bottom {
  @include content-shell;
  margin-top: 64px;
  border-top: 1px solid $slate-800;
  padding-block: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  p {
    margin: 0;
  }

  div {
    display: flex;
    gap: 24px;
  }

  span:hover {
    color: #fff;
    cursor: pointer;
  }
}

@keyframes ping {
  75%,
  100% {
    opacity: 0;
    transform: scale(2);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }

  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

@media (max-width: 1023px) {
  .main-nav {
    display: none;
  }

  .hero__inner,
  .showcase-row {
    grid-template-columns: 1fr;
  }

  .hero__copy {
    padding-right: 0;
    text-align: center;
    justify-items: center;

    h1 {
      font-size: 48px;
    }
  }

  .hero__actions,
  .hero__checks {
    justify-content: center;
  }

  .showcase-row--second {
    .showcase-image {
      order: 2;
    }

    .showcase-copy {
      order: 1;
    }
  }

  .feature-grid,
  .footer-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .topbar {
    flex-direction: column;
    justify-content: center;

    &__claim,
    &__email {
      display: none;
    }
  }

  .site-header__inner,
  .section-inner,
  .stats-grid,
  .footer-grid,
  .footer-bottom,
  .hero__inner,
  .final-cta__content {
    padding-inline: 16px;
  }

  .site-header__inner {
    height: auto;
    min-height: 80px;
    flex-wrap: wrap;
    justify-content: center;
    padding-block: 12px;
  }

  .brand {
    font-size: 22px;
  }

  .login-link {
    display: none;
  }

  .hero {
    padding: 48px 0 80px;

    &__copy {
      h1 {
        font-size: 40px;
      }

      > p {
        font-size: 16px;
      }
    }

    &__actions,
    &__checks {
      flex-direction: column;
      width: 100%;
    }
  }

  .primary-cta,
  .video-cta {
    width: 100%;
    white-space: normal;
  }

  .attendance-card {
    left: 12px;
  }

  .stats-grid,
  .feature-grid,
  .footer-grid {
    grid-template-columns: 1fr;
  }

  .stat-item {
    border-left: 0;
    border-top: 1px solid rgb(96 165 250 / 50%);
    padding-top: 20px;

    &--first {
      border-top: 0;
      padding-top: 0;
    }
  }

  .section-title {
    h3 {
      font-size: 32px;
    }

    p {
      font-size: 16px;
    }
  }

  .showcase-copy {
    h2 {
      font-size: 32px;
    }

    > p {
      font-size: 16px;
    }
  }

  .final-cta__content h2 {
    font-size: 34px;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}
</style>
