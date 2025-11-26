import { component$ } from "@builder.io/qwik";

/**
 * PUBLIC_INTERFACE
 * Header for the app with title and potential actions.
 */
export const Header = component$(() => {
  return (
    <header class="header">
      <h1 class="app-title">Personal Notes</h1>
      <div class="header-actions" aria-hidden="true"></div>
    </header>
  );
});
