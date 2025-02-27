defmodule Dotmd.Repo.Migrations.CreateDots do
  use Ecto.Migration

  def change do
    create table(:dots) do
      add :pos, :integer
      add :color, :integer
      add :user_id, references(:users, on_delete: :nothing)

      timestamps(type: :utc_datetime)
    end

    create index(:dots, [:user_id])
  end
end
