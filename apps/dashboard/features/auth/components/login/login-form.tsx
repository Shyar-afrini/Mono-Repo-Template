"use client";
import loginImage from "@/public/images/cyber.jpg";
import { useForm } from "@tanstack/react-form";
import { createAuthClient } from "@mono-repo-template/auth";
import {
  AnimatedButton,
  Card,
  CardContent,
  Container,
  Flex,
  Input,
  Label,
  LocalizedText,
  Space,
  Text,
  Title,
  ValidationError,
} from "@mono-repo-template/ui";
import { cn } from "@mono-repo-template/utils";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLoginFormValidator } from "../../validators/validators";
import { useRouter } from "next/navigation";
interface LoginFormProps {
  defaultValues?: {
    email: string;
    password: string;
  };
}
const loginFormDefaultValues: LoginFormProps["defaultValues"] = {
  email: "",
  password: "",
};
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const authClient = createAuthClient();
  const { mutate: signIn, isPending, isError } = authClient.signIn();

  const t = useTranslations("auth");
  const form = useForm({
    defaultValues: loginFormDefaultValues,
  });

  const validator = useLoginFormValidator();

  const handleSignIn = () => {
    signIn(
      {
        email: form.state.values.email,
        password: form.state.values.password,
      },
      {
        onSuccess: (data) => {
          router.push("/dashboard");
        },
      }
    );
  };
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Container className="absolute inset-0 min-h-svh w-screen ">
        <Image
          src={loginImage}
          alt="Image"
          className="w-full h-full object-cover dark:brightness-[0.3] z-0 opacity-5"
        />
      </Container>
      <Card className="overflow-hidden p-0 z-10">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-10"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <Flex direction="col" gap={4}>
              <div className="flex flex-col items-center text-center">
                <Title level={1} className="text-xl font-bold">
                  <LocalizedText text={t("login.title")} />
                </Title>
                <Text
                  paragraph
                  className="text-muted-foreground text-balance text-sm"
                >
                  <LocalizedText text={t("login.description")} />
                </Text>
              </div>
              <Flex direction="col" gap={3}>
                <Label htmlFor="email">
                  <LocalizedText text={t("login.email")} />
                </Label>
                <form.Field
                  name="email"
                  validators={{
                    onChange: (field) =>
                      validator.validateEmail(field.value, {
                        required: t("login.emailRequired"),
                        invalid: t("login.emailInvalid"),
                      }),
                  }}
                >
                  {(field) => (
                    <Flex direction="col" gap={1}>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        name={field.name}
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        className={cn(
                          field.state.meta.errors &&
                            field.state.meta.errors.length > 0 &&
                            "border-red-500"
                        )}
                        required
                      />
                      {field.state.meta.errors &&
                        field.state.meta.errors.length > 0 && (
                          <ValidationError
                            message={field.state.meta.errors[0] as string}
                          />
                        )}
                    </Flex>
                  )}
                </form.Field>
              </Flex>
              <Flex direction="col" gap={3}>
                <Label htmlFor="password">
                  <LocalizedText text={t("login.password")} />
                </Label>
                <form.Field
                  validators={{
                    onChange: (field) =>
                      validator.validatePassword(field.value, {
                        required: t("login.passwordRequired"),
                        invalid: t("login.passwordInvalid"),
                        minLength: t("login.passwordMinLength", {
                          minLength: 8,
                        }),
                      }),
                  }}
                  name="password"
                >
                  {(field) => (
                    <Flex direction="col" gap={1}>
                      <Flex direction="col" gap={1} className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          name={field.name}
                          placeholder="********"
                          className={cn(
                            field.state.meta.errors &&
                              field.state.meta.errors.length > 0 &&
                              "border-red-500"
                          )}
                        />
                        {showPassword ? (
                          <EyeIcon
                            className="absolute end-2 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-muted rounded-md p-1.5 min-h-7 min-w-7"
                            size={15}
                            onClick={() => setShowPassword(false)}
                          />
                        ) : (
                          <EyeOffIcon
                            className="absolute end-2 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-muted rounded-md p-1.5 min-h-7 min-w-7"
                            size={15}
                            onClick={() => setShowPassword(true)}
                          />
                        )}
                      </Flex>

                      {field.state.meta.errors &&
                        field.state.meta.errors.length > 0 && (
                          <ValidationError
                            message={field.state.meta.errors[0] as string}
                          />
                        )}
                    </Flex>
                  )}
                </form.Field>
              </Flex>

              <Flex direction="col" gap={2}>
                {isError && (
                  <Flex
                    direction="row"
                    align="center"
                    justify="center"
                    className="w-full p-1.5 py-2 rounded-md bg-red-500/10 border border-red-500/20 text-destructive"
                  >
                    <LocalizedText
                      className="text-xs"
                      text={t("login.error")}
                    />
                  </Flex>
                )}

                <form.Subscribe
                  selector={(state) => [
                    state.canSubmit,
                    state.isSubmitting,
                    state.isPristine,
                  ]}
                >
                  {([canSubmit, isSubmitting, isPristine]) => (
                    <AnimatedButton
                      variant={"default"}
                      isLoading={isPending}
                      loadingText={t("login.loadingText")}
                      onClick={() => handleSignIn()}
                      type="submit"
                      className="w-full cursor-pointer"
                      disabled={
                        !canSubmit || isSubmitting || isPending || isPristine
                      }
                    >
                      <LocalizedText text={t("login.submit")} />
                    </AnimatedButton>
                  )}
                </form.Subscribe>
              </Flex>

              <Container className="text-center text-sm">
                <LocalizedText text={t("login.dontHaveAccount")} />
                <Link href="#" className="underline underline-offset-4">
                  <LocalizedText text={t("login.signUp")} />
                </Link>
              </Container>
            </Flex>
          </form>
          <Container className="bg-muted relative hidden md:block">
            <video
              src="/assets/videos/video.mp4"
              autoPlay
              loop
              muted
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8]"
            />
          </Container>
        </CardContent>
      </Card>
      <Container className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        <LocalizedText text={t("login.byClickingContinue")} />
        <Space spaces={1} />
        <Link href="#">
          <LocalizedText text={t("login.termsOfService")} />
        </Link>
        <LocalizedText text={t("login.and")} />
        <Space spaces={1} />
        <Link href="#">
          <LocalizedText text={t("login.privacyPolicy")} />
        </Link>
      </Container>
    </div>
  );
}
