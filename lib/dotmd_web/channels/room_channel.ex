defmodule DotmdWeb.RoomChannel do
  use DotmdWeb, :channel
  require Logger

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
    dot = Dotmd.Dot.changeset(%Dotmd.Dot{}, payload)
    case Dotmd.Repo.insert(dot) do
      {:ok, _dot} ->
        broadcast(socket, "dot", payload)
        {:noreply, socket}
      {:error, changeset} ->
        Logger.warning "Received invalid dot: #{inspect(changeset)}"
        {:reply, {:error, "Invalid dot"}, socket}
    end
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
