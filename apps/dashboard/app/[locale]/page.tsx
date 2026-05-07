"use client";
import MainPage from "@/components/main/main-page";
import { Container } from "@mono-repo-template/ui";

const Main = () => {
  return (
    <Container className="w-full min-h-svh bg-background flex items-center justify-center">
      <Container className="w-full h-svh fixed inset-0 z-0">
      </Container>
      <MainPage />
    </Container>
  );
};

export default Main;
