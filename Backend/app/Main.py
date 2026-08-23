from database import supabase

print("Supabase connection initialized successfully!")

response = supabase.table("startups").select("*").execute()

print(response.data)

# from fastapi import FastAPI

# from .database import Base, engine

# from .routers import (
#     challenges,
#     startups,
#     applications,
#     evaluations,
#     pilots
# )


# Base.metadata.create_all(bind=engine)


# app = FastAPI(
#     title="Startup Friendly Public Procurement API",
#     description="SIH26136 Innovation Procurement Platform",
#     version="1.0.0"
# )


# app.include_router(
#     challenges.router
# )

# app.include_router(
#     startups.router
# )

# app.include_router(
#     applications.router
# )

# app.include_router(
#     evaluations.router
# )

# app.include_router(
#     pilots.router
# )


# @app.get("/")
# def root():

#     return {
#         "message": "SIH26136 Procurement Platform API",
#         "status": "running"
#     }