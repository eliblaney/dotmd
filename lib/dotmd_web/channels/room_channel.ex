defmodule DotmdWeb.RoomChannel do
  use DotmdWeb, :channel

  @impl true
  def join("room:lobby", payload, socket) do
    if authorized?(payload) do
      dots = Dotmd.Repo.all(Dotmd.Dot)
      {:ok, %{dots: dots}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  @impl true
  def handle_in("new_dot", payload, socket) do
    Dotmd.Repo.insert(%Dotmd.Dot{
      pos: payload["pos"],
      color: payload["color"],
      user: payload["user"]
    })
    broadcast(socket, "dot", payload)
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
