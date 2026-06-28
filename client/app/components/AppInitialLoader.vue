<template>
  <div class="app-initial-loader" aria-busy="true" aria-live="polite" role="status">
    <div class="app-initial-loader__shell">
      <section class="app-initial-loader__intro">
        <span class="app-initial-loader__brand-mark" aria-hidden="true">
          <span class="app-initial-loader__calendar">
            <i v-for="item in 6" :key="item" />
          </span>
        </span>

        <div class="app-initial-loader__copy">
          <span class="app-initial-loader__eyebrow">Schedule Teacher</span>
          <h1>Đang chuẩn bị lớp học</h1>
          <p>Sắp xếp lịch dạy và dữ liệu học viên cho bạn.</p>
        </div>

        <div class="app-initial-loader__progress" aria-hidden="true">
          <span />
        </div>
      </section>

      <section class="app-initial-loader__preview" aria-hidden="true">
        <div class="app-initial-loader__preview-bar">
          <span />
          <strong />
        </div>

        <div class="app-initial-loader__week">
          <span v-for="item in 5" :key="item" />
        </div>

        <div class="app-initial-loader__timeline">
          <div v-for="item in 3" :key="item" class="app-initial-loader__slot">
            <span />
            <strong />
            <i />
          </div>
        </div>

        <div class="app-initial-loader__dock">
          <span v-for="item in 4" :key="item" />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-initial-loader {
  --loader-accent: #ff6b00;
  --loader-border: #dce5f1;
  --loader-cyan: #49beff;
  --loader-primary: #0d6efd;
  --loader-soft: #f5f8ff;
  --loader-text: #17233c;
  --loader-muted: #60718c;

  align-items: center;
  background:
    linear-gradient(140deg, #f8fbff 0%, #eef6ff 52%, #fff9f2 100%);
  display: flex;
  inset: 0;
  justify-content: center;
  min-height: 100vh;
  overflow: hidden;
  padding: 28px;
  position: fixed;
  z-index: 9999;

  &,
  * {
    box-sizing: border-box;
  }

  &::before {
    background-image:
      linear-gradient(rgb(13 110 253 / 7%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(13 110 253 / 7%) 1px, transparent 1px);
    background-size: 44px 44px;
    content: '';
    inset: 0;
    mask-image: linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent);
    opacity: 0.72;
    position: absolute;
  }

  &::after {
    animation: loaderSweep 2.4s ease-in-out infinite;
    background: linear-gradient(90deg, transparent, rgb(255 255 255 / 72%), transparent);
    content: '';
    height: 100%;
    left: -36%;
    position: absolute;
    top: 0;
    transform: skewX(-14deg);
    width: 32%;
  }

  &__shell {
    align-items: center;
    background: rgb(255 255 255 / 78%);
    backdrop-filter: blur(18px);
    border: 1px solid var(--loader-border);
    border-radius: 8px;
    box-shadow: 0 24px 70px rgb(23 35 60 / 12%);
    color: var(--loader-text);
    display: flex;
    gap: 32px;
    max-width: 780px;
    min-height: 312px;
    overflow: hidden;
    padding: 32px;
    position: relative;
    width: min(100%, 780px);
    z-index: 1;
  }

  &__intro {
    display: grid;
    flex: 1 1 330px;
    gap: 20px;
    min-width: 0;
  }

  &__brand-mark {
    align-items: center;
    background: var(--loader-primary);
    border-radius: 8px;
    display: inline-flex;
    height: 66px;
    justify-content: center;
    width: 66px;
  }

  &__calendar {
    background: #fff;
    border-radius: 6px;
    display: grid;
    gap: 3px;
    grid-template-columns: repeat(3, 8px);
    padding: 12px 9px 8px;
    position: relative;

    &::before {
      background: var(--loader-accent);
      border-radius: 6px 6px 2px 2px;
      content: '';
      height: 7px;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
    }

    i {
      animation: loaderCell 1.55s ease-in-out infinite;
      background: #dbeafe;
      border-radius: 2px;
      display: block;
      height: 8px;

      &:nth-child(2n) {
        animation-delay: 140ms;
      }

      &:nth-child(3n) {
        animation-delay: 280ms;
      }
    }
  }

  &__copy {
    display: grid;
    gap: 8px;
  }

  &__eyebrow {
    color: var(--loader-primary);
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h1 {
    color: var(--loader-text);
    font-size: clamp(28px, 3.4vw, 34px);
    font-weight: 800;
    letter-spacing: 0;
    line-height: 1.2;
    margin: 0;
  }

  p {
    color: var(--loader-muted);
    font-size: 15px;
    font-weight: 600;
    line-height: 1.5;
    margin: 0;
    max-width: 360px;
  }

  &__progress {
    background: #dbeafe;
    border-radius: 8px;
    height: 8px;
    overflow: hidden;
    width: min(260px, 100%);

    span {
      animation: loaderBar 1.35s ease-in-out infinite;
      animation-direction: alternate;
      background: linear-gradient(90deg, var(--loader-primary), var(--loader-cyan), var(--loader-accent));
      border-radius: inherit;
      display: block;
      height: 100%;
      width: 44%;
    }
  }

  &__preview {
    animation: loaderFloat 3.4s ease-in-out infinite;
    background: #fff;
    border: 1px solid #e6ebf2;
    border-radius: 8px;
    box-shadow: 0 18px 40px rgb(23 35 60 / 10%);
    display: grid;
    flex: 0 0 318px;
    gap: 14px;
    padding: 18px;
    transform: rotate(1.2deg);
    max-width: 100%;
  }

  &__preview-bar {
    align-items: center;
    display: flex;
    gap: 10px;

    span {
      background: var(--loader-primary);
      border-radius: 8px;
      height: 34px;
      width: 34px;
    }

    strong {
      background: #eaf1fb;
      border-radius: 8px;
      display: block;
      height: 18px;
      width: 138px;
    }
  }

  &__week {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(5, 1fr);

    span {
      background: #f1f5f9;
      border: 1px solid #e6ebf2;
      border-radius: 8px;
      height: 44px;

      &:nth-child(3) {
        background: #eff6ff;
        border-color: #bfdbfe;
      }
    }
  }

  &__timeline {
    display: grid;
    gap: 10px;
  }

  &__slot {
    align-items: center;
    background: #f8fbff;
    border: 1px solid #e6ebf2;
    border-radius: 8px;
    display: grid;
    gap: 12px;
    grid-template-columns: 42px 1fr 36px;
    min-height: 58px;
    padding: 10px 12px;

    span,
    strong,
    i {
      border-radius: 8px;
      display: block;
    }

    span {
      background: #dbeafe;
      height: 14px;
    }

    strong {
      animation: loaderLine 1.7s ease-in-out infinite;
      background: linear-gradient(90deg, #eaf1fb, #fff, #eaf1fb);
      background-size: 220% 100%;
      height: 22px;
    }

    i {
      background: var(--loader-accent);
      height: 28px;
      opacity: 0.82;
    }

    &:nth-child(2) i {
      background: var(--loader-primary);
    }

    &:nth-child(3) i {
      background: var(--loader-cyan);
    }
  }

  &__dock {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(4, 1fr);

    span {
      background: #eef3fa;
      border-radius: 8px;
      height: 8px;
    }
  }
}

@keyframes loaderSweep {
  0%,
  28% {
    transform: translateX(0) skewX(-14deg);
  }

  100% {
    transform: translateX(440%) skewX(-14deg);
  }
}

@keyframes loaderCell {
  0%,
  100% {
    background: #dbeafe;
    transform: translateY(0);
  }

  50% {
    background: #93c5fd;
    transform: translateY(-1px);
  }
}

@keyframes loaderBar {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(128%);
  }
}

@keyframes loaderLine {
  0% {
    background-position: 120% 0;
  }

  100% {
    background-position: -120% 0;
  }
}

@keyframes loaderFloat {
  0%,
  100% {
    transform: rotate(1.2deg) translateY(0);
  }

  50% {
    transform: rotate(0.3deg) translateY(-8px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-initial-loader {
    &::after,
    &__calendar i,
    &__progress span,
    &__preview,
    &__slot strong {
      animation: none;
    }

    &__progress span {
      transform: translateX(52%);
    }
  }
}

@media (max-width: 720px) {
  .app-initial-loader {
    justify-content: flex-start;
    padding: 18px;

    &__shell {
      align-items: stretch;
      display: grid;
      gap: 24px;
      min-height: 0;
      padding: 24px;
    }

    &__preview {
      display: none;
    }
  }
}

@media (max-width: 560px) {
  .app-initial-loader {
    &__shell {
      padding: 22px;
      width: min(100%, 350px);
    }

    p {
      font-size: 14px;
    }

    h1 {
      font-size: 26px;
    }
  }
}
</style>
