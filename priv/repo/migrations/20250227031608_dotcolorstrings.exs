defmodule Dotmd.Repo.Migrations.Dotcolorstrings do
  use Ecto.Migration

  def change do
    alter table(:dots) do
      modify :color, :string
    end
  end
end
