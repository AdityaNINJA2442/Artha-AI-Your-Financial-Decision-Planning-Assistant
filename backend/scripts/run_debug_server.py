import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import traceback
from fastapi import Request
from fastapi.responses import JSONResponse
from app.main import app

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("=================== LIVE 500 EXCEPTION CAUGHT ===================")
    print(f"PATH: {request.url.path}")
    print(f"METHOD: {request.method}")
    traceback.print_exc()
    print("================================================================")
    return JSONResponse(
        status_code=500,
        content={"detail": f"INTERNAL SERVER ERROR: {str(exc)}", "type": str(type(exc))}
    )

if __name__ == "__main__":
    import uvicorn
    print("Starting Debug Server on Port 8000...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
