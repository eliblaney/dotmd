defmodule Dotmd.Repo do
  use Ecto.Repo,
    otp_app: :dotmd,
    adapter: Ecto.Adapters.Postgres
end
