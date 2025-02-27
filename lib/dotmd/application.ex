defmodule Dotmd.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      DotmdWeb.Telemetry,
      Dotmd.Repo,
      {DNSCluster, query: Application.get_env(:dotmd, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Dotmd.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: Dotmd.Finch},
      # Start a worker by calling: Dotmd.Worker.start_link(arg)
      # {Dotmd.Worker, arg},
      # Start to serve requests, typically the last entry
      DotmdWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Dotmd.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    DotmdWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
