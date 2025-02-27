defmodule Dotmd.Repo.Migrations.Userstrings do
  use Ecto.Migration

  def change do
    alter table(:dots) do
      remove :user_id
      add :user, :string
    end

    drop table("users")
  end
end
