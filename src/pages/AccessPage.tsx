import { Alert, Button, Form, Input } from "antd";
import { KeyRound, LogIn, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { appConfig } from "../app/appConfig";
import "./AccessPage.css";

type AccessFormValues = {
  code: string;
};

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/api/")) {
    return "/home";
  }

  return value === "/access" ? "/home" : value;
}

export function AccessPage() {
  const [form] = Form.useForm<AccessFormValues>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const nextPath = useMemo(() => getSafeNextPath(searchParams.get("next")), [searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/auth/session", { signal: controller.signal })
      .then((response) => {
        if (response.ok) {
          navigate(nextPath, { replace: true });
        }
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [navigate, nextPath]);

  const submitAccessCode = async ({ code }: AccessFormValues) => {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        setError(payload.message || "访问码不正确，请重新输入。");
        form.setFields([{ name: "code", errors: ["请检查访问码"] }]);
        return;
      }

      navigate(nextPath, { replace: true });
    } catch {
      setError("验证服务暂时不可用，请稍后再试。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="access-page">
      <section className="access-page__panel" aria-labelledby="access-page-title">
        <div className="access-page__inner">
          <div className="access-page__brand">
            <div className="access-page__brand-mark" aria-hidden="true">
              <ShieldCheck size={22} />
            </div>
            <div className="access-page__brand-text">
              <div className="access-page__brand-name">{appConfig.accessTitle}</div>
              <div className="access-page__brand-subtitle">{appConfig.accessSubtitle}</div>
            </div>
          </div>

          <h1 className="access-page__title" id="access-page-title">
            输入访问码
          </h1>
          <p className="access-page__description">验证通过后会保持 3 天登录状态。</p>

          {error ? <Alert className="access-page__alert" message={error} showIcon type="error" /> : null}

          <Form className="access-page__form" form={form} layout="vertical" onFinish={submitAccessCode} requiredMark={false}>
            <Form.Item
              label="访问码"
              name="code"
              rules={[{ required: true, whitespace: true, message: "请输入访问码" }]}
            >
              <Input.Password
                autoComplete="current-password"
                autoFocus
                prefix={<KeyRound size={16} />}
                placeholder="请输入访问码"
                size="large"
              />
            </Form.Item>
            <Button
              className="access-page__submit"
              htmlType="submit"
              icon={<LogIn size={16} />}
              loading={submitting}
              size="large"
              type="primary"
            >
              进入系统
            </Button>
          </Form>

          <div className="access-page__meta">访问状态由服务端签发的安全 Cookie 保存，退出登录后会立即失效。</div>
        </div>
      </section>
    </main>
  );
}
